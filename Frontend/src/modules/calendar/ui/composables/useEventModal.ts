import { ref, reactive, watch, computed, nextTick } from 'vue';
import { useCalendarStore } from '../store/calendar.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { ElMessage, type FormInstance } from 'element-plus';
import { useCepLocator } from '@/core/composables/useCepLocator';
import type { ICalendarEvent } from '../../domain/entities/calendar';
import type { ICustomer } from '@/modules/customer/domain/entities/customer';

export function useEventModal(props: { isOpen: boolean, eventData?: Partial<ICalendarEvent> }, emit: (event: 'close' | 'save' | 'delete', payload?: any) => void) {
    const store = useCalendarStore();
    const customerStore = useCustomerStore();

    const ruleFormRef = ref<FormInstance | null>(null);
    const activeTab = ref('general');
    const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

    const loadingClients = ref(false);
    const clientOptions = ref<{ label: string; value: string }[]>([]);

    const loadClients = async () => {
        console.log('[loadClients] Starting...');
        loadingClients.value = true;
        
        try {
            await customerStore.fetch();
            console.log('[loadClients] items after fetch:', customerStore.items.length);
            
            await nextTick();
            
            const options = customerStore.items.map((c: ICustomer) => ({
                label: c.name || c.companyName || c.tradeName || 'Sem nome',
                value: c.id
            }));
            
            setTimeout(() => {
                clientOptions.value = options;
                console.log('[loadClients] options set:', options.length);
            }, 50);
            
        } catch (e) {
            console.error('[loadClients] Error:', e);
        }
        
        setTimeout(() => { loadingClients.value = false; }, 100);
    };

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
        postMeetingNotes: '',
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
        isBlocker: false
    });

    const rules = computed(() => ({
        title: [{ required: true, message: form.isBlocker ? 'O motivo é obrigatório' : 'O título é obrigatório', trigger: 'blur' }],
        userId: [{ required: true, message: 'Selecione o profissional', trigger: 'change' }],
        date: [{ required: true, message: 'A data é obrigatória', trigger: 'blur' }],
        time: [{ required: true, message: 'O horário é obrigatório', trigger: 'blur' }],
        client: [{ required: !form.isBlocker, message: 'O cliente é obrigatório', trigger: 'change' }],
        description: [{ required: false, message: 'A descrição é obrigatória', trigger: 'blur' }]
    }));

    const getSelectedClientName = (clientId: string) => {
        const client = clientOptions.value.find(c => c.value === clientId);
        return client?.label || clientId;
    };

    watch(() => form.isBlocker, () => {
        activeTab.value = 'general';
    });

    const blockerInaccessibleTabs = ['details', 'recurrence', 'postMeeting'];
    watch([() => form.isBlocker, () => activeTab.value], ([isBlocker, tab]) => {
        if (isBlocker && blockerInaccessibleTabs.includes(tab as string)) {
            activeTab.value = 'general';
        }
    });

    watch(() => props.isOpen, async (isOpen) => {
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
                postMeetingNotes: '',
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
                console.log('[useEventModal] props.eventData on edit:', JSON.parse(JSON.stringify(props.eventData)));
                Object.assign(form, props.eventData);
                console.log('[useEventModal] form AFTER Object.assign:', JSON.parse(JSON.stringify(form)));

                if (form.client) {
                    clientOptions.value = [{ label: form.client, value: (props.eventData as any).clientId || form.client }];
                }
            }
            
            await nextTick();
            await loadClients();
        }
    }, { immediate: true });
    
    const refreshClientOptions = loadClients;
    
    const handleStartTimeChange = (val: string) => {
        if (!val) return;
        const [hours = 0, minutes = 0] = val.split(':').map(Number);
        const date = new Date();
        date.setHours(hours + 1, minutes);
        form.endTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const { formatAndSearchCep: _formatCep } = useCepLocator();

    const formatAndSearchCep = async (val: string) => {
        form.cep = await _formatCep(val, (fullAddress) => {
            form.address = fullAddress;
        });
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
                const payload = { ...form } as any;
                
                console.log('[submitForm] form.userId:', form.userId, 'form.date:', form.date, 'form.time:', form.time);

                // Montar startDate e endDate no formato ISO 8601
                try {
                    let dateStr = form.date as any;
                    if (dateStr instanceof Date) {
                        dateStr = dateStr.toISOString().split('T')[0];
                    } else if (!dateStr || typeof dateStr !== 'string') {
                        dateStr = new Date().toISOString().split('T')[0];
                    }

                    // Força a criação do startDate mesmo se form.time estiver vazio
                    const tStart = form.time || '00:00';
                    const [hStart = '0', mStart = '0'] = tStart.split(':');
                    const d1 = new Date(`${dateStr}T00:00:00`);
                    d1.setHours(parseInt(hStart, 10), parseInt(mStart, 10), 0, 0);
                    payload.startDate = d1.toISOString();

                    // Força a criação do endDate mesmo se form.endTime estiver vazio
                    const tEnd = form.endTime || '23:59';
                    const [hEnd = '23', mEnd = '59'] = tEnd.split(':');
                    const d2 = new Date(`${dateStr}T00:00:00`);
                    d2.setHours(parseInt(hEnd, 10), parseInt(mEnd, 10), 0, 0);
                    payload.endDate = d2.toISOString();
                    
                } catch (e) {
                    console.error('Erro ao formatar data/hora:', e);
                    ElMessage.error('Erro ao formatar data/hora. Verifique os campos.');
                    return;
                }

                console.log('[submitForm] FINAL PAYLOAD:', JSON.stringify(payload));

                // Remove temp fields to not pollute DB
                delete payload.date;
                delete payload.time;
                delete payload.endTime;

                emit('save', payload);
            } else {
                ElMessage.warning('Preencha todos os campos obrigatórios.');
            }
        });
    };

    return {
        store, ruleFormRef, activeTab, weekDays, isEditing, clientOptions, loadingClients,
        form, rules, preDefinedColors, formatAndSearchCep, handleStartTimeChange, loadClients, refreshClientOptions,
        selectType, handleClose, submitForm, getSelectedClientName
    };
}