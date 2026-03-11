<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && handleClose()" width="1050px" align-center
        destroy-on-close :show-close="false" class="enterprise-ticket-dialog">

        <template #header>
            <div
                class="flex justify-between items-center w-full px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl">
                <div class="flex items-center gap-4">
                    <div
                        class="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-xs font-mono font-bold border border-slate-200 shadow-sm flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full" :class="getStatusColor(form.status)"></div>
                        {{ headerTitle }}
                    </div>
                    <div class="h-5 w-px bg-slate-200"></div>
                    <div class="flex items-center gap-2 text-slate-600 text-sm font-medium w-[350px]">
                        <el-icon class="text-slate-400">
                            <User />
                        </el-icon>
                        <input v-model="form.customer" placeholder="Nome do Cliente ou Empresa..."
                            class="bg-transparent border-none outline-none text-slate-700 font-semibold w-full placeholder-slate-400 focus:ring-0"
                            :disabled="isViewing" />
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <el-button plain size="small" @click="handleClose"
                        class="!border-slate-200 !text-slate-500 hover:!bg-slate-50">
                        <el-icon class="text-base">
                            <Close />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </template>

        <div class="flex gap-0 h-[680px] max-h-[75vh] w-full bg-white rounded-b-xl overflow-hidden">
            <div class="flex-1 flex flex-col border-r border-slate-200 h-full bg-white">

                <div class="px-8 pt-6 pb-3 shrink-0">
                    <textarea v-model="form.title" rows="1"
                        class="w-full text-xl font-bold text-slate-800 placeholder-slate-300 border-none outline-none bg-transparent resize-none focus:ring-0 leading-tight transition-all hover:bg-slate-50 focus:bg-slate-50 p-2 -ml-2 rounded-lg"
                        placeholder="Título do chamado..." @input="autoResize" :disabled="isViewing"></textarea>
                </div>

                <div class="flex-1 flex flex-col min-h-0 overflow-hidden mt-1">
                    <el-tabs v-model="activeTab" class="px-8 enterprise-tabs h-full flex flex-col overflow-hidden">
                        <el-tab-pane label="Descrição Geral" name="main" class="h-full flex flex-col overflow-hidden">
                            <div class="flex flex-col h-full pb-6 overflow-hidden mt-2">
                                <div class="flex-1 overflow-y-auto custom-scroll pr-2">
                                    <div class="mb-2 bg-white border border-slate-200 rounded-t-lg px-3 py-2 flex items-center gap-2 border-b-0"
                                        :class="{ 'opacity-50 pointer-events-none': isViewing }">
                                        <el-button text size="small" class="!p-2"
                                            @click="insertFormat('**', '**')"><span
                                                class="font-bold text-slate-600">B</span></el-button>
                                        <el-button text size="small" class="!p-2" @click="insertFormat('*', '*')"><span
                                                class="italic text-slate-600">I</span></el-button>
                                        <div class="w-px h-4 bg-slate-200 mx-1"></div>
                                        <el-button text size="small" class="!p-2"
                                            @click="insertFormat('\n- ', '')"><el-icon class="text-slate-600">
                                                <List />
                                            </el-icon></el-button>
                                    </div>
                                    <el-input ref="descriptionInputRef" v-model="form.description" type="textarea"
                                        :rows="10" placeholder="Descreva o problema ou solicitação detalhadamente..."
                                        class="w-full enterprise-textarea" :disabled="isViewing" />

                                    <TicketChecklist v-model:items="form.checklist" :readonly="isViewing" />
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Histórico (Chat)" name="chat" class="h-full flex flex-col overflow-hidden">
                            <div class="flex flex-col h-full pb-6 mt-2 overflow-hidden">
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

                                <div class="grid grid-cols-2 gap-4 mt-6">
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
                                        class="col-span-2 text-center py-12 text-sm text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-xl">
                                        Nenhum documento anexado a este ticket.
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>

            <div class="w-[320px] bg-slate-50/50 p-6 flex flex-col gap-0 h-full overflow-y-auto custom-scroll">

                <div class="pb-5 border-b border-slate-200/80 mb-5">
                    <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">Fase
                        Atual</span>
                    <el-select v-model="form.status" class="w-full enterprise-select" :disabled="isViewing"
                        size="large">
                        <template #prefix>
                            <div :class="['w-2 h-2 rounded-full', getStatusColor(form.status)]"></div>
                        </template>
                        <el-option label="Aberto (Novo)" value="open" />
                        <el-option label="Em Andamento" value="in-progress" />
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
                    <div class="flex gap-1 w-full bg-slate-200/50 p-1 rounded-lg"
                        :class="{ 'opacity-75 pointer-events-none': isViewing }">
                        <div v-for="p in ['low', 'medium', 'high', 'urgent']" :key="p" @click="form.priority = p"
                            :class="['flex-1 text-center py-2 rounded-md text-xs font-bold cursor-pointer transition-all', form.priority === p ? getPriorityStyle(p) + ' shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50']">
                            {{ getPriorityName(p) }}
                        </div>
                    </div>
                </div>

                <TicketTagsSelector v-model:selected-tags="form.tags" :readonly="isViewing" />

                <div class="mt-auto pt-6 flex gap-3">
                    <el-button
                        class="flex-1 !ml-0 !h-10 !font-bold !text-[13px] !rounded-lg !text-slate-600 !border-slate-300 hover:!bg-slate-100 hover:!border-slate-400 transition-colors"
                        @click="handleClose">
                        Fechar
                    </el-button>

                    <el-button v-if="!isViewing" type="primary"
                        class="flex-1 !ml-0 !h-10 !font-bold !text-[13px] !rounded-lg shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                        @click="submit" :loading="loading">
                        Salvar Ticket
                    </el-button>

                    <el-button v-if="isViewing" type="primary"
                        class="flex-1 !ml-0 !h-10 !font-bold !text-[13px] !rounded-lg shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                        @click="$emit('switch-edit')">
                        <el-icon class="mr-1 text-base">
                            <Edit />
                        </el-icon>
                        Editar Ticket
                    </el-button>
                </div>

            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue';
import { User, Close, Edit, List, Delete, UploadFilled, ChatLineRound, Promotion } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import type { ITicket } from '../../domain/entities/Ticket';
import { TicketStatus } from '../../domain/valueObjects/ticket-status.enum';
import { TicketPriority } from '../../domain/valueObjects/ticket-priority.enum';
import TicketChecklist from './TicketChecklist.vue';
import TicketTagsSelector from './TicketTagsSelector.vue';

const props = defineProps<{
    isOpen: boolean;
    ticket?: ITicket | null;
    isViewing?: boolean;
    initialData?: any;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', data: any): void;
    (e: 'switch-edit'): void;
}>();

const loading = ref(false);
const isEditing = ref(false);
const activeTab = ref('main');
const descriptionInputRef = ref();
const newChatMessage = ref('');

interface ChecklistItem { text: string; done: boolean; }
interface ChatMessage { sender: string; text: string; time: string; isAgent: boolean; }

const form = reactive({
    title: '',
    customer: '',
    status: TicketStatus.OPEN as string,
    priority: TicketPriority.MEDIUM as string,
    description: '',
    assignees: [] as string[],
    tags: [] as string[],
    attachments: [] as any[],
    checklist: [] as ChecklistItem[],
    chatHistory: [] as ChatMessage[]
});

const teamMembers = ref([
    { id: '1', name: 'Você' },
    { id: '2', name: 'Atendente Alpha' },
    { id: '3', name: 'Gestor' }
]);

const headerTitle = computed(() => {
    if (props.ticket) {
        return props.isViewing ? `TICKET-${props.ticket.id}` : `EDITAR-${props.ticket.id}`;
    }
    return 'NOVO TICKET';
});

watch(() => props.isOpen, (val) => {
    if (val) {
        if (props.ticket) {
            isEditing.value = true;
            form.title = props.ticket.title;
            form.customer = props.ticket.customer;
            form.status = props.ticket.status;
            form.priority = props.ticket.priority;
            form.description = (props.ticket as any).description || '';
            form.assignees = (props.ticket as any).assignees || ['1'];
            form.tags = (props.ticket as any).tags || [];
            form.attachments = (props.ticket as any).attachments || [];
            form.checklist = (props.ticket as any).checklist || [];
            form.chatHistory = (props.ticket as any).chatHistory || [];
        } else if (props.initialData) {
            isEditing.value = false;
            form.title = props.initialData.title || '';
            form.customer = props.initialData.customer || '';
            form.status = props.initialData.status || TicketStatus.OPEN;
            form.priority = props.initialData.priority || TicketPriority.MEDIUM;
            form.description = props.initialData.description || '';
            form.assignees = props.initialData.assignees || ['1'];
            form.tags = props.initialData.tags || [];
            form.attachments = props.initialData.attachments || [];
            form.checklist = props.initialData.checklist || [];
            form.chatHistory = props.initialData.chatHistory || [];
        } else {
            isEditing.value = false;
            form.title = '';
            form.customer = '';
            form.status = TicketStatus.OPEN;
            form.priority = TicketPriority.MEDIUM;
            form.description = '';
            form.assignees = ['1'];
            form.tags = [];
            form.attachments = [];
            form.checklist = [];
            form.chatHistory = [];
        }
        activeTab.value = 'main';
        newChatMessage.value = '';
    }
});

const sendChatMessage = () => {
    if (!newChatMessage.value.trim()) return;
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    form.chatHistory.push({
        sender: 'Você',
        text: newChatMessage.value.trim(),
        time: timeString,
        isAgent: true
    });
    newChatMessage.value = '';

    setTimeout(() => {
        const scrollEl = document.querySelector('.el-tab-pane[aria-hidden="false"] .custom-scroll');
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
    }, 50);
};

const autoResize = (e: Event) => {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
};

const insertFormat = (pre: string, pos: string) => {
    const txt = form.description;
    const input = descriptionInputRef.value?.textarea;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    form.description = txt.substring(0, start) + pre + txt.substring(start, end) + pos + txt.substring(end);
};

const handleAttachmentChange = (file: UploadFile) => form.attachments.push({ name: file.name, size: file.size || 0, raw: file.raw });
const removeAttachment = (idx: number) => form.attachments.splice(idx, 1);

const getTeamMemberName = (id: string) => teamMembers.value.find(u => u.id === id)?.name || '?';

const getStatusColor = (s: string) => ({ 'open': 'bg-amber-400', 'in-progress': 'bg-blue-500', 'resolved': 'bg-green-500' }[s] || 'bg-slate-400');

const getPriorityStyle = (p: string) => ({
    'low': 'bg-white text-slate-700',
    'medium': 'bg-white text-blue-700',
    'high': 'bg-white text-orange-700',
    'urgent': 'bg-white text-red-700'
}[p] || '');

const getPriorityName = (p: string) => {
    return { 'low': 'Baixa', 'medium': 'Normal', 'high': 'Alta', 'urgent': 'Crítica' }[p] || p;
};

const handleClose = () => {
    emit('close');
};

const submit = () => {
    if (!form.title) {
        ElMessage.warning('O Título é obrigatório!');
        return;
    }
    loading.value = true;
    emit('save', { ...form });
    loading.value = false;
};
</script>

<style>
.enterprise-ticket-dialog {
    border-radius: 12px !important;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important;
}

.enterprise-ticket-dialog .el-dialog__header {
    padding: 0;
    margin-right: 0;
}

.enterprise-ticket-dialog .el-dialog__body {
    padding: 0 !important;
}

.enterprise-tabs .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #e2e8f0;
}

.enterprise-tabs .el-tabs__item {
    font-weight: 600;
    color: #64748b;
    font-size: 13px;
}

.enterprise-tabs .el-tabs__item.is-active {
    color: #0f172a;
    font-weight: 700;
}

.enterprise-tabs .el-tabs__active-bar {
    background-color: #3b82f6;
    height: 3px;
    border-radius: 3px 3px 0 0;
}
</style>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

:deep(.enterprise-select .el-select__wrapper) {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px #e2e8f0 inset !important;
    font-weight: 600;
    color: #334155;
    padding: 8px 12px;
}

:deep(.enterprise-select .el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 2px #3b82f6 inset !important;
}

:deep(.enterprise-upload .el-upload-dragger) {
    background-color: #f8fafc;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    transition: all 0.2s;
}

:deep(.enterprise-upload .el-upload-dragger:hover) {
    background-color: #f1f5f9;
    border-color: #94a3b8;
}

:deep(.enterprise-textarea textarea) {
    border: 1px solid #e2e8f0 !important;
    border-top: none !important;
    border-radius: 0 0 8px 8px !important;
    background-color: #ffffff !important;
    padding: 16px !important;
    color: #334155;
    resize: none;
    font-size: 14px;
    line-height: 1.6;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.02);
    transition: border-color 0.2s, box-shadow 0.2s;
}

:deep(.enterprise-textarea textarea:focus) {
    border-color: #cbd5e1 !important;
    box-shadow: inset 0 0 0 1px #f1f5f9 !important;
    outline: none;
}
</style>