<template>
    <el-dialog :model-value="isOpen" :title="isEditing ? 'Editar Evento' : 'Novo Agendamento'" width="650px"
        @close="handleClose" destroy-on-close :close-on-click-modal="false" class="rounded-xl overflow-hidden">
        <el-tabs v-model="activeTab" class="px-2">

            <el-tab-pane label="Geral" name="general">
                <el-form ref="ruleFormRef" :model="form" :rules="rules" label-position="top" class="mt-2" status-icon>
                    <el-form-item label="Título" prop="title">
                        <el-input v-model="form.title" placeholder="Ex: Reunião Comercial" size="large" />
                    </el-form-item>

                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="Agendar para (Profissional)" prop="userId">
                            <el-select v-model="form.userId" class="!w-full" placeholder="Selecione de quem é a agenda">
                                <template #prefix><el-icon>
                                        <User />
                                    </el-icon></template>
                                <el-option v-for="user in store.availableUsers" :key="user.id" :label="user.name"
                                    :value="user.id" />
                            </el-select>
                        </el-form-item>

                        <el-form-item label="Cliente" prop="client">
                            <el-select v-model="form.client" placeholder="Selecione o Cliente" filterable remote
                                :remote-method="searchClients" :loading="loadingClients" class="!w-full">
                                <template #prefix><el-icon>
                                        <Briefcase />
                                    </el-icon></template>
                                <el-option v-for="client in clientOptions" :key="client.id" :label="client.name"
                                    :value="client.name" />
                            </el-select>
                        </el-form-item>
                    </div>

                    <div class="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <el-form-item label="Data" prop="date" class="!mb-0">
                            <el-date-picker v-model="form.date" type="date" format="DD/MM/YYYY"
                                value-format="YYYY-MM-DD" class="!w-full" :prefix-icon="Calendar" :clearable="false" />
                        </el-form-item>

                        <el-form-item label="Horário Início" class="!mb-0" prop="time">
                            <el-time-select v-model="form.time" start="00:00" step="00:15" end="23:45" class="!w-full"
                                placeholder="Início" @change="handleStartTimeChange" :clearable="false" />
                        </el-form-item>

                        <el-form-item label="Horário Fim" class="!mb-0" prop="endTime">
                            <el-time-select v-model="form.endTime" :min-time="form.time" start="00:00" step="00:15"
                                end="23:45" class="!w-full" placeholder="Fim" :clearable="false" />
                        </el-form-item>
                    </div>

                    <el-form-item label="Cor de Identificação" class="mt-4">
                        <div class="flex gap-2">
                            <div v-for="type in eventTypes" :key="type.hex" @click="selectType(type)"
                                :class="['w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border-2 transition-all', form.dotClass === type.dot ? 'border-slate-600 scale-110' : 'border-transparent']"
                                :style="{ backgroundColor: type.hex }">
                                <el-icon v-if="form.dotClass === type.dot" color="#fff">
                                    <Check />
                                </el-icon>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane label="Detalhes" name="details">
                <el-form :model="form" label-position="top">
                    <el-form-item label="Descrição">
                        <el-input v-model="form.description" type="textarea" :rows="3"
                            placeholder="Detalhes adicionais do compromisso..." />
                    </el-form-item>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <el-form-item label="CEP (Opcional)" class="md:col-span-1">
                            <el-input v-model="form.cep" placeholder="00000-000" @input="formatAndSearchCep"
                                maxlength="9">
                                <template #prefix><el-icon>
                                        <Search />
                                    </el-icon></template>
                            </el-input>
                        </el-form-item>

                        <el-form-item label="Local / Endereço" class="md:col-span-2">
                            <el-input v-model="form.address" placeholder="Ex: Rua, Número, ou Link do Meet">
                                <template #prefix><el-icon>
                                        <Location />
                                    </el-icon></template>
                            </el-input>
                        </el-form-item>
                    </div>

                    <el-form-item label="Agendado por (Responsável)">
                        <el-input v-model="form.createdBy" disabled><template #prefix><el-icon>
                                    <UserFilled />
                                </el-icon></template></el-input>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane label="Recorrência" name="recurrence">
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4 flex items-center justify-between">
                    <div>
                        <h4 class="font-bold text-blue-800">Repetir Agendamento?</h4>
                        <p class="text-xs text-blue-600">Os horários da aba "Geral" serão mantidos.</p>
                    </div>
                    <el-switch v-model="form.isRecurring" />
                </div>

                <div v-if="form.isRecurring" class="flex flex-col gap-4 animate-fade-in">
                    <el-form-item label="Tipo de Repetição">
                        <el-radio-group v-model="form.recurrenceType" class="!w-full">
                            <el-radio-button label="daily" class="!w-1/3">Diário</el-radio-button>
                            <el-radio-button label="weekly" class="!w-1/3">Semanal</el-radio-button>
                            <el-radio-button label="monthly" class="!w-1/3">Mensal</el-radio-button>
                        </el-radio-group>
                    </el-form-item>

                    <div v-if="form.recurrenceType === 'weekly'"
                        class="bg-slate-50 p-3 rounded border border-slate-200">
                        <span class="text-xs font-bold text-slate-500 uppercase mb-2 block">Repetir nos dias:</span>
                        <el-checkbox-group v-model="form.recurrenceDays" size="small">
                            <el-checkbox-button v-for="(day, index) in weekDays" :key="index" :label="index">{{ day
                            }}</el-checkbox-button>
                        </el-checkbox-group>
                    </div>

                    <div v-if="form.recurrenceType === 'monthly'"
                        class="text-sm text-slate-500 bg-orange-50 p-2 rounded border border-orange-100 flex items-center gap-2">
                        <el-icon class="text-orange-500">
                            <InfoFilled />
                        </el-icon>
                        O evento repetirá todo dia <strong>{{ new Date(form.date).getDate() + 1 }}</strong> de cada mês.
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="Data Final da Repetição">
                            <el-date-picker v-model="form.recurrenceEndDate" type="date" placeholder="Até quando?"
                                format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="!w-full" />
                        </el-form-item>

                        <div class="text-right text-xs text-slate-400 flex flex-col justify-center">
                            <span>Início: {{ form.time }}</span>
                            <span>Fim: {{ form.endTime }}</span>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

        <template #footer>
            <div class="flex justify-between w-full pt-4 border-t border-slate-100">
                <el-button v-if="isEditing" type="danger" plain @click="$emit('delete', form.id)">Excluir</el-button>
                <div v-else></div>
                <div class="flex gap-2">
                    <el-button @click="handleClose">Cancelar</el-button>
                    <el-button type="primary" @click="submitForm" class="!px-6 !font-bold">Confirmar</el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted } from 'vue';
import { Check, Calendar, User, UserFilled, Briefcase, InfoFilled, Location, Search } from '@element-plus/icons-vue';
import { useAgendaStore } from '../store/agenda.store';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';

const props = defineProps<{ isOpen: boolean; eventData?: any; }>();
const emit = defineEmits(['close', 'save', 'delete']);
const store = useAgendaStore();

const ruleFormRef = ref<FormInstance>();
const activeTab = ref('general');
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const isEditing = computed(() => !!props.eventData?.id);

const clientOptions = ref<{ id: string, name: string }[]>([]);
const loadingClients = ref(false);

const form = reactive({
    id: '',
    title: '',
    userId: '',
    client: '',
    date: '',
    time: '',
    endTime: '',
    description: '',
    cep: '',
    address: '',
    createdBy: '',
    colorClass: 'text-blue-600',
    dotClass: 'bg-blue-400',
    isRecurring: false,
    recurrenceType: 'weekly',
    recurrenceDays: [] as number[],
    recurrenceEndDate: ''
});

const rules = reactive<FormRules>({
    title: [{ required: true, message: 'Informe o título do evento', trigger: 'blur' }],
    userId: [{ required: true, message: 'Selecione para qual profissional é o agendamento', trigger: 'change' }],
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
    if (cep.length > 5) {
        form.cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
    } else {
        form.cep = cep;
    }

    if (cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                form.address = `${data.logradouro}, nº  - ${data.bairro}, ${data.localidade} - ${data.uf}`;
                ElMessage.success({ message: 'Endereço encontrado!', grouping: true });
            } else {
                ElMessage.warning('CEP não encontrado.');
            }
        } catch (error) {
            ElMessage.error('Erro ao buscar o CEP na internet.');
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

onMounted(() => { searchClients(''); });

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
    await ruleFormRef.value.validate((valid, fields) => {
        if (valid) {
            emit('save', { ...form });
        } else {
            ElMessage.warning('Preencha os campos obrigatórios na aba "Geral".');
            activeTab.value = 'general';
        }
    });
};
</script>