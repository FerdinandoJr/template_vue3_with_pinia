import { reactive, watch, computed, ref, onMounted } from 'vue';
import { useCalendarStore } from '../store/calendar.store';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { cepService } from '@/core/services/cep.service';

export function useEventModal(props: { isOpen: boolean, eventData?: any }, emit: any) {
    const store = useCalendarStore();

    const ruleFormRef = ref<FormInstance>();
    const activeTab = ref('general');
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const isEditing = computed(() => !!props.eventData?.id);

    const clientOptions = ref<{ id: string, name: string }[]>([]);
    const loadingClients = ref(false);

    const form = reactive({
        id: '', title: '', userId: '', client: '', date: '', time: '', endTime: '',
        description: '', cep: '', address: '', createdBy: '', colorClass: 'text-blue-600',
        dotClass: 'bg-blue-400', isRecurring: false, recurrenceType: 'weekly',
        recurrenceDays: [] as number[], recurrenceEndDate: ''
    });

    const rules = reactive<FormRules>({
        title: [{ required: true, message: 'Informe o título do evento', trigger: 'blur' }],
        userId: [{ required: true, message: 'Selecione o profissional', trigger: 'change' }],
        client: [{ required: true, message: 'Selecione um cliente', trigger: 'change' }],
        date: [{ required: true, message: 'Selecione a data', trigger: 'change' }],
        time: [{ required: true, message: 'Horário obrigatório', trigger: 'change' }],
        endTime: [{ required: true, message: 'Horário obrigatório', trigger: 'change' }],
    });

    const eventTypes = [
        { hex: '#34d399', dot: 'bg-emerald-400', text: 'text-emerald-700' },
        { hex: '#fbbf24', dot: 'bg-amber-400', text: 'text-amber-600' },
        { hex: '#60a5fa', dot: 'bg-blue-400', text: 'text-blue-600' },
        { hex: '#f87171', dot: 'bg-red-400', text: 'text-red-600' },
        { hex: '#a78bfa', dot: 'bg-purple-400', text: 'text-purple-600' }
    ];

    const formatAndSearchCep = async (value: string) => {
        let cep = value.replace(/\D/g, '');
        if (cep.length > 5) form.cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
        else form.cep = cep;

        if (cep.length === 8) {
            try {
                const address = await cepService.getAddressByCep(cep);
                form.address = `${address.logradouro}, nº - ${address.bairro}, ${address.cidade} - ${address.uf}`;
                ElMessage.success({ message: 'Endereço encontrado!', grouping: true });
            } catch (error: any) {
                ElMessage.warning(error.message || 'Erro ao buscar o CEP.');
            }
        }
    };

    const handleStartTimeChange = (newTime: string) => {
        if (!newTime) return;
        const parts = newTime.split(':');
        const h = Number(parts[0] || '0');
        const m = Number(parts[1] || '0');
        const d = new Date(); d.setHours(h + 1, m);
        form.endTime = d.toTimeString().substring(0, 5);
    };

    const searchClients = (query: string) => {
        loadingClients.value = true;
        setTimeout(() => {
            clientOptions.value = [
                { id: '1', name: 'Empresa Tech Solutions' },
                { id: '2', name: 'Supermercado Modelo' },
                { id: '3', name: 'Consultoria ABC' }
            ];
            loadingClients.value = false;
        }, 300);
    };

    onMounted(() => searchClients(''));

    watch(() => props.isOpen, (val) => {
        if (val) {
            activeTab.value = 'general';
            setTimeout(() => ruleFormRef.value?.clearValidate(), 50);

            if (props.eventData) {
                const defaultDate = new Date();
                const defaultCreator = store.currentUser?.name ?? 'Desconhecido';

                Object.assign(form, {
                    id: props.eventData.id || '',
                    title: props.eventData.title || '',
                    userId: props.eventData.userId || store.currentUser?.id || '',
                    client: props.eventData.client || '',
                    date: props.eventData.date || defaultDate.toISOString().split('T')[0],
                    time: props.eventData.time || '09:00',
                    endTime: props.eventData.endTime || (props.eventData.time ? (() => {
                        const parts = props.eventData.time.split(':');
                        const h = Number(parts[0] || '0');
                        const m = Number(parts[1] || '0');
                        const d = new Date(); d.setHours(h + 1, m);
                        return d.toTimeString().substring(0, 5);
                    })() : '10:00'),
                    description: props.eventData.description || '',
                    cep: props.eventData.cep || '',
                    address: props.eventData.address || '',
                    createdBy: props.eventData.createdBy || defaultCreator,
                    dotClass: props.eventData.dotClass || 'bg-blue-400',
                    isRecurring: !!props.eventData.groupId,
                    recurrenceType: props.eventData.recurrenceType || 'weekly',
                    recurrenceDays: props.eventData.recurrenceDays || [new Date(props.eventData.date || new Date()).getDay()]
                });
                if (!form.endTime && form.time) handleStartTimeChange(form.time);
            }
        }
    });

    const selectType = (type: any) => { form.dotClass = type.dot; form.colorClass = type.text; };
    const handleClose = () => emit('close');

    const submitForm = async () => {
        if (!ruleFormRef.value) return;
        await ruleFormRef.value.validate().then((valid) => {
            if (valid) emit('save', { ...form });
        }).catch(() => {
            ElMessage.warning('Preencha os campos obrigatórios na aba "Geral".');
            activeTab.value = 'general';
        });
    };

    return {
        store, ruleFormRef, activeTab, weekDays, isEditing, clientOptions,
        loadingClients, form, rules, eventTypes, formatAndSearchCep,
        handleStartTimeChange, searchClients, selectType, handleClose, submitForm
    };
}