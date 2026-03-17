import { ref, reactive, watch, computed } from 'vue';
import { useCalendarStore } from '../store/calendar.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { ElMessage } from 'element-plus';
import { cepService } from '@/core/services/cep.service';

export function useEventModal(props: any, emit: any) {
    const store = useCalendarStore();
    const customerStore = useCustomerStore();

    const ruleFormRef = ref<any>(null);
    const activeTab = ref('general');
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    const loadingClients = ref(false);
    const clientOptions = ref<{ id: string; name: string }[]>([]);

    const isEditing = computed(() => !!props.eventData?.id);

    const preDefinedColors = [
        { hex: '#ef4444', text: 'text-red-700', dot: 'bg-red-400' },
        { hex: '#b91c1c', text: 'text-red-900', dot: 'bg-red-600' },
        { hex: '#f97316', text: 'text-orange-700', dot: 'bg-orange-400' },
        { hex: '#f59e0b', text: 'text-amber-700', dot: 'bg-amber-400' },
        { hex: '#eab308', text: 'text-yellow-700', dot: 'bg-yellow-400' },
        { hex: '#84cc16', text: 'text-lime-700', dot: 'bg-lime-400' },
        { hex: '#22c55e', text: 'text-green-700', dot: 'bg-green-400' },
        { hex: '#15803d', text: 'text-green-900', dot: 'bg-green-600' },
        { hex: '#10b981', text: 'text-emerald-700', dot: 'bg-emerald-400' },
        { hex: '#14b8a6', text: 'text-teal-700', dot: 'bg-teal-400' },
        { hex: '#06b6d4', text: 'text-cyan-700', dot: 'bg-cyan-400' },
        { hex: '#0ea5e9', text: 'text-sky-700', dot: 'bg-sky-400' },
        { hex: '#3b82f6', text: 'text-blue-700', dot: 'bg-blue-400' },
        { hex: '#1d4ed8', text: 'text-blue-900', dot: 'bg-blue-600' },
        { hex: '#6366f1', text: 'text-indigo-700', dot: 'bg-indigo-400' },
        { hex: '#8b5cf6', text: 'text-violet-700', dot: 'bg-violet-400' },
        { hex: '#a855f7', text: 'text-purple-700', dot: 'bg-purple-400' },
        { hex: '#d946ef', text: 'text-fuchsia-700', dot: 'bg-fuchsia-400' },
        { hex: '#ec4899', text: 'text-pink-700', dot: 'bg-pink-400' },
        { hex: '#f43f5e', text: 'text-rose-700', dot: 'bg-rose-400' },
        { hex: '#64748b', text: 'text-slate-700', dot: 'bg-slate-400' },
        { hex: '#71717a', text: 'text-zinc-700', dot: 'bg-zinc-400' },
        { hex: '#78716c', text: 'text-stone-700', dot: 'bg-stone-400' },
        { hex: '#475569', text: 'text-slate-800', dot: 'bg-slate-500' },
        { hex: '#0f172a', text: 'text-slate-900', dot: 'bg-slate-800' }
    ];

    const form = reactive({
        id: '',
        title: '',
        userId: '',
        client: '',
        date: '',
        time: '',
        endTime: '',
        description: '',
        address: '',
        cep: '',
        createdBy: 'Você',
        colorHex: '#3b82f6',
        colorClass: 'text-blue-700',
        dotClass: 'bg-blue-400',
        type: 'meeting',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceDays: [] as number[],
        recurrenceEndDate: '',
        hasBilling: false,
        isBlocker: false // NOVO CAMPO: Define se é um bloqueio
    });

    // Regras reativas (o cliente deixa de ser obrigatório se for bloqueio)
    const rules = computed(() => ({
        title: [{ required: true, message: form.isBlocker ? 'O motivo é obrigatório' : 'O título é obrigatório', trigger: 'blur' }],
        userId: [{ required: true, message: 'Selecione o profissional', trigger: 'change' }],
        date: [{ required: true, message: 'A data é obrigatória', trigger: 'blur' }],
        time: [{ required: true, message: 'O horário é obrigatório', trigger: 'blur' }],
        client: [{ required: !form.isBlocker, message: 'O cliente é obrigatório', trigger: 'change' }],
        description: [{ required: false, message: 'A descrição é obrigatória', trigger: 'blur' }]
    }));

    watch(() => props.isOpen, (isOpen) => {
        if (isOpen) {
            activeTab.value = 'general';

            Object.assign(form, {
                id: '',
                title: '',
                userId: store.availableUsers[0]?.id || '',
                client: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                endTime: '10:00',
                description: '',
                address: '',
                cep: '',
                createdBy: 'Você',
                colorHex: '#3b82f6',
                colorClass: 'text-blue-700',
                dotClass: 'bg-blue-400',
                type: 'meeting',
                isRecurring: false,
                recurrenceType: 'weekly',
                recurrenceDays: [],
                recurrenceEndDate: '',
                hasBilling: false,
                isBlocker: false
            });
            clientOptions.value = [];

            if (props.eventData) {
                Object.assign(form, props.eventData);

                if (form.client) {
                    clientOptions.value = [{ id: form.client, name: form.client }];
                }
            }
        }
    });

    const searchClients = async (query: string) => {
        loadingClients.value = true;
        if (customerStore.items.length === 0) await customerStore.fetch();

        if (query) {
            const lowerQuery = query.toLowerCase();
            clientOptions.value = customerStore.items
                .filter((c: any) => {
                    const name = c.tradeName || c.companyName || c.name || '';
                    return name.toLowerCase().includes(lowerQuery);
                })
                .map((c: any) => ({ id: c.uuid, name: c.tradeName || c.companyName || c.name }));
        } else {
            clientOptions.value = customerStore.items.slice(0, 50).map((c: any) => ({
                id: c.uuid, name: c.tradeName || c.companyName || c.name
            }));
        }
        loadingClients.value = false;
    };

    const handleStartTimeChange = (val: string) => {
        if (!val) return;
        const [hours = 0, minutes = 0] = val.split(':').map(Number);
        const date = new Date();
        date.setHours(hours + 1, minutes);
        form.endTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const formatAndSearchCep = async (val: string) => {
        let v = val.replace(/\D/g, '');
        if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        form.cep = v;

        if (v.length === 9) {
            const cleanCep = v.replace('-', '');
            try {
                const address = await cepService.getAddressByCep(cleanCep);
                form.address = `${address.logradouro}, ${address.bairro}, ${address.cidade} - ${address.uf}`;
                ElMessage.success('Endereço preenchido!');
            } catch (error) {
                ElMessage.warning('CEP não encontrado');
            }
        }
    };

    const selectType = (color: any) => {
        form.colorHex = color.hex;
        form.colorClass = color.text;
        form.dotClass = color.dot;
    };

    const handleClose = () => {
        emit('close');
    };

    const submitForm = async () => {
        if (!ruleFormRef.value) return;
        await ruleFormRef.value.validate((valid: boolean) => {
            if (valid) {
                emit('save', { ...form });
            } else {
                ElMessage.warning('Preencha todos os campos obrigatórios.');
            }
        });
    };

    return {
        store, ruleFormRef, activeTab, weekDays, isEditing, clientOptions, loadingClients,
        form, rules, preDefinedColors, formatAndSearchCep, handleStartTimeChange, searchClients,
        selectType, handleClose, submitForm
    };
}