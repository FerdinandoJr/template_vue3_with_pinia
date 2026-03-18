<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && handleClose()" width="95%"
        style="max-width: 1050px;" align-center destroy-on-close :show-close="false" class="enterprise-ticket-dialog">

        <template #header>
            <div
                class="flex flex-wrap lg:flex-nowrap justify-between items-center w-full px-4 lg:px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl gap-4">
                <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 w-full">
                    <div
                        class="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-xs font-mono font-bold border border-slate-200 shadow-sm flex items-center gap-2 shrink-0">
                        <div class="w-2 h-2 rounded-full" :class="getStatusColor(form.status)"></div>
                        {{ headerTitle }}
                    </div>
                    <div class="hidden sm:block h-5 w-px bg-slate-200"></div>
                    <div class="flex items-center gap-2 text-slate-600 text-sm font-medium w-full sm:w-[350px]">
                        <el-icon class="text-slate-400 shrink-0">
                            <User />
                        </el-icon>
                        <el-select v-model="form.customer" filterable placeholder="Selecione o Cliente..."
                            class="w-full custom-transparent-select" :disabled="isViewing">
                            <el-option v-for="client in customerStore.items" :key="client.uuid"
                                :label="client.tradeName || client.companyName || client.name"
                                :value="client.tradeName || client.companyName || client.name" />
                        </el-select>
                    </div>
                </div>
                <div class="flex items-center absolute top-4 right-4 lg:relative lg:top-auto lg:right-auto">
                    <el-button plain size="small" @click="handleClose"
                        class="!border-slate-200 !text-slate-500 hover:!bg-slate-50">
                        <el-icon class="text-base">
                            <Close />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </template>

        <div
            class="flex flex-col lg:flex-row gap-0 max-h-[85vh] lg:h-[680px] w-full bg-white rounded-b-xl overflow-y-auto lg:overflow-hidden">

            <div
                class="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 h-auto lg:h-full bg-white min-h-[450px]">
                <div class="px-4 lg:px-8 pt-6 pb-3 shrink-0">
                    <textarea v-model="form.title" rows="1"
                        class="w-full text-xl font-bold text-slate-800 placeholder-slate-300 border-none outline-none bg-transparent resize-none focus:ring-0 leading-tight transition-all hover:bg-slate-50 focus:bg-slate-50 p-2 -ml-2 rounded-lg"
                        placeholder="Título do chamado..." @input="autoResize" :disabled="isViewing"></textarea>
                </div>

                <div class="flex-1 flex flex-col min-h-[400px] overflow-visible lg:overflow-hidden mt-1">
                    <el-tabs v-model="activeTab"
                        class="px-4 lg:px-8 enterprise-tabs h-full flex flex-col overflow-visible lg:overflow-hidden">
                        <el-tab-pane label="Descrição Geral" name="main"
                            class="h-full flex flex-col overflow-visible lg:overflow-hidden">
                            <div class="flex flex-col h-full pb-6 overflow-visible lg:overflow-hidden mt-2">
                                <div class="flex-1 overflow-y-auto custom-scroll pr-2">

                                    <div
                                        class="w-full border border-slate-200 rounded-lg overflow-hidden transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 mb-4">
                                        <QuillEditor v-model:content="form.description" contentType="html" theme="snow"
                                            toolbar="full" class="min-h-[250px] bg-white"
                                            placeholder="Descreva o problema ou solicitação detalhadamente..."
                                            :readOnly="isViewing" />
                                    </div>

                                    <TicketChecklist v-model:items="form.checklist" :readonly="isViewing" />
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Histórico (Chat)" name="chat"
                            class="h-full flex flex-col overflow-visible lg:overflow-hidden">
                            <div class="flex flex-col h-full pb-6 mt-2 overflow-visible lg:overflow-hidden">
                                <div
                                    class="flex-1 overflow-y-auto custom-scroll p-4 bg-slate-50/50 rounded-lg border border-slate-200 flex flex-col gap-4">
                                    <div v-if="form.chatHistory.length === 0" class="m-auto text-center">
                                        <div
                                            class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                            <el-icon :size="20">
                                                <ChatLineRound />
                                            </el-icon>
                                        </div>
                                        <p class="text-sm text-slate-500 font-medium">Nenhum histórico de chat anexado a
                                            este
                                            ticket.</p>
                                    </div>

                                    <div v-for="(msg, i) in form.chatHistory" :key="i"
                                        :class="['flex w-full', msg.isAgent ? 'justify-end' : 'justify-start']">
                                        <div
                                            :class="['max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm relative', msg.isAgent ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm']">
                                            <div class="font-bold text-[11px] mb-1.5 uppercase tracking-wide"
                                                :class="msg.isAgent ? 'text-blue-200' : 'text-slate-400'">
                                                {{ msg.sender }}
                                            </div>
                                            <div class="leading-relaxed whitespace-pre-wrap">{{ msg.text }}</div>
                                            <div class="text-[10px] text-right mt-2"
                                                :class="msg.isAgent ? 'text-blue-300' : 'text-slate-400'">
                                                {{ msg.time }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-4 flex gap-3 shrink-0 items-end" v-if="!isViewing">
                                    <div
                                        class="flex-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                        <textarea v-model="newChatMessage" rows="1"
                                            placeholder="Adicionar nota ou mensagem..."
                                            class="w-full bg-transparent border-none outline-none resize-none p-2 text-sm text-slate-700 placeholder-slate-400"
                                            @keyup.enter.prevent="sendChatMessage" @input="autoResize"></textarea>
                                    </div>
                                    <el-button type="primary"
                                        class="!h-11 !w-11 !rounded-lg !p-0 shadow-md shadow-blue-500/20"
                                        @click="sendChatMessage" :disabled="!newChatMessage.trim()">
                                        <el-icon :size="18">
                                            <Promotion />
                                        </el-icon>
                                    </el-button>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Arquivos e Anexos" name="files"
                            class="h-full overflow-y-auto custom-scroll pb-6">
                            <div class="mt-4">
                                <el-upload v-if="!isViewing" drag multiple action="#" :auto-upload="false"
                                    :on-change="handleAttachmentChange" :show-file-list="false"
                                    class="w-full enterprise-upload">
                                    <el-icon class="el-icon--upload text-slate-300">
                                        <UploadFilled />
                                    </el-icon>
                                    <div class="el-upload__text font-medium text-slate-500">Arraste arquivos aqui ou <em
                                            class="text-blue-600 font-bold not-italic">clique para buscar</em></div>
                                </el-upload>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <div v-for="(file, idx) in form.attachments" :key="idx"
                                        class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-slate-300 transition-colors">
                                        <div
                                            class="w-10 h-10 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-slate-200">
                                            {{ file.name.split('.').pop()?.substring(0, 3) }}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-sm font-semibold text-slate-700 truncate">{{ file.name }}</p>
                                            <p class="text-xs text-slate-400">{{ (file.size / 1024).toFixed(1) }} KB</p>
                                        </div>
                                        <el-button v-if="!isViewing" link type="danger"
                                            class="opacity-0 group-hover:opacity-100" @click="removeAttachment(idx)">
                                            <el-icon>
                                                <Delete />
                                            </el-icon>
                                        </el-button>
                                    </div>

                                    <div v-if="form.attachments.length === 0"
                                        class="col-span-1 sm:col-span-2 text-center py-12 text-sm text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-xl">
                                        Nenhum documento anexado a este ticket.
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>

            <div
                class="w-full lg:w-[320px] bg-slate-50/50 p-6 flex flex-col gap-0 h-auto lg:h-full overflow-y-visible lg:overflow-y-auto custom-scroll shrink-0">
                <div class="pb-5 border-b border-slate-200/80 mb-5">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Fase
                        Atual</span>
                    <el-select v-model="form.status" class="w-full enterprise-select" :disabled="isViewing"
                        size="large">
                        <template #prefix>
                            <div :class="['w-2 h-2 rounded-full', getStatusColor(form.status)]"></div>
                        </template>
                        <el-option label="Aberto (Novo)" value="open" />
                        <el-option label="Em Andamento" value="in_progress" />
                        <el-option label="Resolvido (Finalizado)" value="resolved" />
                    </el-select>
                </div>

                <div class="pb-5 border-b border-slate-200/80 mb-5">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Equipe
                        Atribuída</span>
                    <el-select v-model="form.assignees" multiple filterable placeholder="Atribuir membros..."
                        class="w-full mb-3 enterprise-select" :disabled="isViewing">
                        <el-option v-for="user in teamMembers" :key="user.id" :label="user.name" :value="user.id" />
                    </el-select>

                    <div v-if="form.assignees.length > 0" class="flex -space-x-2 overflow-hidden px-1">
                        <el-avatar v-for="uid in form.assignees" :key="uid" :size="34"
                            class="border-2 border-white bg-indigo-600 font-bold text-xs shadow-sm">
                            {{ getTeamMemberName(uid).charAt(0) }}
                        </el-avatar>
                    </div>
                </div>

                <div class="pb-5 border-b border-slate-200/80 mb-5">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Nível de
                        Prioridade</span>
                    <div class="flex flex-wrap lg:flex-nowrap gap-1 w-full bg-slate-200/50 p-1 rounded-lg"
                        :class="{ 'opacity-75 pointer-events-none': isViewing }">
                        <div v-for="p in ['low', 'medium', 'high', 'urgent']" :key="p" @click="form.priority = p"
                            :class="['flex-1 min-w-[60px] text-center py-2 rounded-md text-xs font-bold cursor-pointer transition-all', form.priority === p ? getPriorityStyle(p) + ' shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50']">
                            {{ getPriorityName(p) }}
                        </div>
                    </div>
                </div>

                <TicketTagsSelector v-model:selected-tags="form.tags" :readonly="isViewing" />

                <div class="mt-8 lg:mt-auto pt-5 border-t border-slate-200/80">
                    <el-button v-if="isViewing" type="primary" size="large" class="w-full !font-bold"
                        @click="$emit('switch-edit')">
                        <el-icon class="mr-2">
                            <Edit />
                        </el-icon> Editar Ticket
                    </el-button>
                    <el-button v-else type="primary" size="large" :loading="loading"
                        class="w-full !font-bold shadow-md shadow-blue-500/30" @click="submit">
                        {{ props.ticket?.id ? 'Atualizar Ticket' : 'Criar Ticket' }}
                    </el-button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { UploadFilled, Close, Delete, Promotion, User, ChatLineRound, Edit } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import TicketChecklist from './TicketChecklist.vue';
import TicketTagsSelector from './TicketTagsSelector.vue';
import type { ITicket } from '../../domain/entities/Ticket';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps<{
    isOpen: boolean;
    ticket?: ITicket | null;
    isViewing?: boolean;
    initialData?: any;
}>();

const emit = defineEmits(['close', 'save', 'switch-edit']);

const customerStore = useCustomerStore();

const activeTab = ref('main');
const loading = ref(false);
const newChatMessage = ref('');

const headerTitle = computed(() => {
    if (props.isViewing) return `TICKET #${props.ticket?.id}`;
    return props.ticket?.id ? `EDITAR #${props.ticket.id}` : 'NOVO TICKET';
});

const teamMembers = [
    { id: 'u1', name: 'João Silva' },
    { id: 'u2', name: 'Maria Santos' },
    { id: 'u3', name: 'Ana Costa' },
    { id: 'u4', name: 'Pedro Almeida' },
];

const form = reactive({
    title: '',
    customer: '',
    description: '',
    status: 'open',
    priority: 'low',
    assignees: [] as string[],
    tags: [] as string[],
    checklist: [] as any[],
    chatHistory: [] as any[],
    attachments: [] as any[],
});

// FUNÇÃO ISOLADA E PROTEGIDA PARA POPULAR O MODAL
const initForm = () => {
    if (customerStore.items.length === 0) {
        customerStore.fetch();
    }
    activeTab.value = 'main';
    newChatMessage.value = '';

    if (props.ticket) {
        form.title = props.ticket.title || '';
        form.customer = props.ticket.customer || '';
        form.description = props.ticket.description || '';
        form.status = (props.ticket.status as unknown as string) || 'open';
        form.priority = (props.ticket.priority as unknown as string) || 'low';
        form.assignees = (props.ticket as any).assignees || [];
        form.tags = (props.ticket as any).tags || [];
        form.checklist = (props.ticket as any).checklist || [];
        form.chatHistory = Array.isArray((props.ticket as any).chatHistory) ? [...(props.ticket as any).chatHistory] : [];
        form.attachments = (props.ticket as any).attachments || [];
    } else if (props.initialData) {
        form.title = props.initialData.title || '';
        form.customer = props.initialData.customer || '';
        form.description = props.initialData.description || '';
        form.chatHistory = Array.isArray(props.initialData.chatHistory) ? [...props.initialData.chatHistory] : [];
        form.status = 'open';
        form.priority = 'low';
        form.assignees = [];
        form.tags = [];
        form.checklist = [];
        form.attachments = [];
    } else {
        form.title = '';
        form.customer = '';
        form.description = '';
        form.status = 'open';
        form.priority = 'low';
        form.assignees = [];
        form.tags = [];
        form.checklist = [];
        form.chatHistory = [];
        form.attachments = [];
    }
};

// O SEGREDO ESTÁ AQUI: immediate: true força a renderização exata no momento em que v-if for chamado
watch(() => props.isOpen, (newVal) => {
    if (newVal) initForm();
}, { immediate: true });

const getTeamMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || 'User';

const getStatusColor = (status: string) => {
    const map: Record<string, string> = { 'open': 'bg-amber-500', 'in_progress': 'bg-blue-500', 'resolved': 'bg-green-500' };
    return map[status] || 'bg-slate-400';
};

const getPriorityStyle = (priority: string) => {
    const map: Record<string, string> = { 'low': 'bg-slate-100 text-slate-700', 'medium': 'bg-blue-100 text-blue-700', 'high': 'bg-amber-100 text-amber-700', 'urgent': 'bg-red-100 text-red-700' };
    return map[priority] || 'bg-slate-100 text-slate-700';
};

const getPriorityName = (priority: string) => {
    const map: Record<string, string> = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta', 'urgent': 'Urgente' };
    return map[priority] || 'Baixa';
};

const autoResize = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
};

const handleAttachmentChange = (file: UploadFile) => { if (file.raw) form.attachments.push(file.raw); };
const removeAttachment = (index: number) => { form.attachments.splice(index, 1); };

const sendChatMessage = () => {
    if (!newChatMessage.value.trim()) return;
    form.chatHistory.push({
        sender: 'Você (Agente)',
        text: newChatMessage.value.trim(),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isAgent: true
    });
    newChatMessage.value = '';
};

const submit = () => {
    if (!form.title) { ElMessage.warning('Preencha pelo menos o título.'); return; }
    loading.value = true;
    setTimeout(() => { emit('save', { ...form, id: props.ticket?.id }); loading.value = false; }, 500);
};

const handleClose = () => { emit('close'); };
</script>

<style scoped>
:deep(.enterprise-ticket-dialog) {
    border-radius: 12px;
    overflow: hidden;
    padding: 0;
}

:deep(.enterprise-ticket-dialog .el-dialog__header) {
    display: none;
}

:deep(.enterprise-ticket-dialog .el-dialog__body) {
    padding: 0;
    background-color: #f8fafc;
}

:deep(.enterprise-tabs .el-tabs__header) {
    margin: 0;
    background-color: white;
    border-bottom: 1px solid #f1f5f9;
}

:deep(.enterprise-tabs .el-tabs__nav-wrap::after) {
    display: none;
}

:deep(.enterprise-tabs .el-tabs__item) {
    font-weight: 600;
    color: #64748b;
    height: 48px;
    line-height: 48px;
    padding: 0 20px;
}

:deep(.enterprise-tabs .el-tabs__item.is-active) {
    color: #2563eb;
}

:deep(.enterprise-tabs .el-tabs__active-bar) {
    background-color: #2563eb;
    height: 3px;
    border-radius: 3px 3px 0 0;
}

:deep(.enterprise-select .el-input__wrapper) {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px #e2e8f0 inset;
}

:deep(.enterprise-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #3b82f6 inset;
}

:deep(.enterprise-upload .el-upload-dragger) {
    background-color: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    transition: all 0.2s ease;
}

:deep(.enterprise-upload .el-upload-dragger:hover) {
    border-color: #3b82f6;
    background-color: #eff6ff;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}

:deep(.custom-transparent-select .el-select__wrapper) {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0;
}

:deep(.custom-transparent-select .el-select__placeholder) {
    font-weight: 600;
    color: #334155;
}

:deep(.ql-toolbar.ql-snow) {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
    font-family: inherit;
    border-radius: 8px 8px 0 0;
}

:deep(.ql-container.ql-snow) {
    border: none;
    font-family: inherit;
    font-size: 14px;
}

:deep(.ql-editor) {
    min-height: 250px;
    color: #334155;
}

:deep(.ql-editor.ql-blank::before) {
    font-style: normal;
    color: #94a3b8;
}
</style>