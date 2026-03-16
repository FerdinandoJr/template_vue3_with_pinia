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

    const eventTypes = [
        { hex: '#f8fafc', dot: 'bg-slate-400' },
        { hex: '#eff6ff', dot: 'bg-blue-400' },
        { hex: '#f0fdf4', dot: 'bg-green-400' },
        { hex: '#fef2f2', dot: 'bg-red-400' },
        { hex: '#fffbeb', dot: 'bg-yellow-400' },
        { hex: '#f5f3ff', dot: 'bg-purple-400' }
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
        colorClass: 'text-blue-700',
        dotClass: 'bg-blue-400',
        type: 'meeting',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceDays: [] as number[],
        recurrenceEndDate: '',
        hasBilling: false
    });

    const rules = {
        title: [{ required: true, message: 'O título é obrigatório', trigger: 'blur' }],
        userId: [{ required: true, message: 'Selecione o profissional', trigger: 'change' }],
        date: [{ required: true, message: 'A data é obrigatória', trigger: 'blur' }],
        time: [{ required: true, message: 'O horário é obrigatório', trigger: 'blur' }],
        client: [{ required: true, message: 'O cliente é obrigatório', trigger: 'change' }],
        description: [{ required: true, message: 'A descrição é obrigatória', trigger: 'blur' }]
    };

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
                colorClass: 'text-blue-700',
                dotClass: 'bg-blue-400',
                type: 'meeting',
                isRecurring: false,
                recurrenceType: 'weekly',
                recurrenceDays: [],
                recurrenceEndDate: '',
                hasBilling: false
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

        if (customerStore.items.length === 0) {
            await customerStore.fetch();
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            clientOptions.value = customerStore.items
                .filter((c: any) => {
                    const name = c.tradeName || c.companyName || c.name || '';
                    return name.toLowerCase().includes(lowerQuery);
                })
                .map((c: any) => ({
                    id: c.uuid,
                    name: c.tradeName || c.companyName || c.name
                }));
        } else {
            clientOptions.value = customerStore.items.slice(0, 50).map((c: any) => ({
                id: c.uuid,
                name: c.tradeName || c.companyName || c.name
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

    const selectType = (type: any) => {
        form.dotClass = type.dot;
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
                ElMessage.warning('Preencha todos os campos obrigatórios (verifique as abas Geral e Detalhes).');
            }
        });
    };

    return {
        store,
        ruleFormRef,
        activeTab,
        weekDays,
        isEditing,
        clientOptions,
        loadingClients,
        form,
        rules,
        eventTypes,
        formatAndSearchCep,
        handleStartTimeChange,
        searchClients,
        selectType,
        handleClose,
        submitForm
    };
}