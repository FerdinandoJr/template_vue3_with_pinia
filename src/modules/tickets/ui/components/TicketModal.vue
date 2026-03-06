<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && handleClose()" width="1000px" align-center
        destroy-on-close :show-close="false" class="custom-ticket-dialog">
        <template #header>
            <div class="flex justify-between items-center w-full px-5 py-3 border-b border-slate-100 bg-white">
                <div class="flex items-center gap-3">
                    <div
                        class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-mono font-bold border border-blue-100">
                        #{{ ticket ? (isViewing ? 'TICKET-' + ticket.id : 'EDITAR-' + ticket.id) : 'NOVO-TICKET' }}
                    </div>
                    <span class="text-slate-300">/</span>
                    <div class="flex items-center gap-2 text-slate-500 text-xs font-semibold truncate max-w-[300px]">
                        <el-icon>
                            <User />
                        </el-icon>
                        <input v-model="form.customer" placeholder="Nome do Cliente ou Empresa..."
                            class="bg-transparent border-none outline-none text-slate-500 font-semibold w-full"
                            :disabled="isViewing" />
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <el-button link @click="handleClose">
                        <el-icon class="text-lg">
                            <Close />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </template>

        <div class="flex gap-0 h-[650px] max-h-[75vh] w-full bg-white rounded-b-lg overflow-hidden">

            <div class="flex-1 flex flex-col border-r border-slate-100 h-full">
                <div class="px-6 pt-6 pb-2 shrink-0">
                    <textarea v-model="form.title" rows="1"
                        class="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 border-none outline-none bg-transparent resize-none focus:ring-0"
                        placeholder="Título do chamado..." @input="autoResize" :disabled="isViewing"></textarea>
                </div>

                <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <el-tabs v-model="activeTab" class="px-6 custom-tabs h-full flex flex-col overflow-hidden">

                        <el-tab-pane label="Descrição" name="main" class="h-full flex flex-col overflow-hidden">
                            <div class="flex flex-col h-full pb-4 overflow-hidden">
                                <div class="mt-4 mb-2 bg-slate-50 border border-slate-200 rounded px-2 py-1 flex items-center gap-2 shrink-0"
                                    :class="{ 'opacity-50 pointer-events-none': isViewing }">
                                    <el-button link size="small" @click="insertFormat('**', '**')"><span
                                            class="font-bold">B</span></el-button>
                                    <el-button link size="small" @click="insertFormat('*', '*')"><span
                                            class="italic">I</span></el-button>
                                    <div class="w-px h-3 bg-slate-300"></div>
                                    <el-button link size="small" @click="insertFormat('\n- ', '')"><el-icon>
                                            <List />
                                        </el-icon></el-button>
                                </div>
                                <div class="flex-1 overflow-y-auto custom-scroll pr-1">
                                    <el-input ref="descriptionInputRef" v-model="form.description" type="textarea"
                                        :rows="12" placeholder="Descreva o problema detalhadamente..."
                                        class="w-full description-textarea" :disabled="isViewing" />

                                    <div class="mt-8 mb-6">
                                        <h4
                                            class="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                            <el-icon>
                                                <List />
                                            </el-icon> Checklist de Execução
                                        </h4>
                                        <div class="space-y-2">
                                            <div v-for="(item, index) in form.checklist" :key="index"
                                                class="flex items-center gap-3 group bg-slate-50 p-2 rounded">
                                                <el-checkbox v-model="item.done" :disabled="isViewing" />
                                                <input v-model="item.text"
                                                    class="flex-1 bg-transparent border-none outline-none text-sm transition-all"
                                                    :style="item.done ? { textDecoration: 'line-through', textDecorationColor: '#10b981', textDecorationThickness: '2px', color: '#94a3b8', fontStyle: 'italic' } : {}"
                                                    placeholder="Nova tarefa..." :disabled="isViewing" />
                                                <el-button v-if="!isViewing" link type="danger" size="small"
                                                    @click="removeChecklistItem(index)">
                                                    <el-icon>
                                                        <Delete />
                                                    </el-icon>
                                                </el-button>
                                            </div>
                                            <el-button v-if="!isViewing" link type="primary" size="small"
                                                @click="addChecklistItem" class="mt-2">
                                                + Adicionar Tarefa
                                            </el-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Anexos" name="files" class="h-full overflow-y-auto custom-scroll pb-4">
                            <div class="mt-4">
                                <el-upload v-if="!isViewing" drag multiple action="#" :auto-upload="false"
                                    :on-change="handleAttachmentChange" :show-file-list="false" class="w-full">
                                    <el-icon class="el-icon--upload">
                                        <UploadFilled />
                                    </el-icon>
                                    <div class="el-upload__text font-sans">Arraste ou clique para anexar</div>
                                </el-upload>

                                <div class="grid grid-cols-2 gap-3 mt-6">
                                    <div v-for="(file, idx) in form.attachments" :key="idx"
                                        class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm group relative overflow-hidden">
                                        <div
                                            class="w-10 h-10 rounded bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                                            {{ file.name.split('.').pop() }}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs font-bold text-slate-700 truncate">{{ file.name }}</p>
                                            <p class="text-[10px] text-slate-400">{{ (file.size / 1024).toFixed(1) }} KB
                                            </p>
                                        </div>
                                        <el-button v-if="!isViewing" link type="danger" @click="removeAttachment(idx)">
                                            <el-icon>
                                                <Delete />
                                            </el-icon>
                                        </el-button>
                                    </div>
                                    <div v-if="form.attachments.length === 0"
                                        class="col-span-2 text-center py-6 text-sm text-slate-400 font-medium">
                                        Nenhum arquivo anexado.
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>

            <div
                class="w-[300px] bg-slate-50 p-5 flex flex-col gap-6 border-l border-slate-200 h-full overflow-y-auto custom-scroll">

                <div>
                    <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</span>
                    <el-select v-model="form.status" class="w-full" :disabled="isViewing">
                        <template #prefix>
                            <div :class="['w-2 h-2 rounded-full mr-2', getStatusColor(form.status)]"></div>
                        </template>
                        <el-option label="Aberto" value="open" />
                        <el-option label="Em Andamento" value="in-progress" />
                        <el-option label="Resolvido" value="resolved" />
                    </el-select>
                </div>

                <div>
                    <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Responsáveis</span>
                    <el-select v-model="form.assignees" multiple filterable placeholder="Adicionar..."
                        class="w-full mb-3" :disabled="isViewing">
                        <el-option v-for="user in teamMembers" :key="user.id" :label="user.name" :value="user.id" />
                    </el-select>
                    <div class="flex -space-x-2 overflow-hidden">
                        <el-avatar v-for="uid in form.assignees" :key="uid" :size="32"
                            class="border-2 border-white bg-purple-600 font-bold text-[10px]">
                            {{ getTeamMemberName(uid).charAt(0) }}
                        </el-avatar>
                    </div>
                </div>

                <div>
                    <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Prioridade</span>
                    <div class="flex gap-1 w-full" :class="{ 'opacity-60 pointer-events-none': isViewing }">
                        <div v-for="p in ['low', 'medium', 'high', 'urgent']" :key="p" @click="form.priority = p"
                            :class="['flex-1 text-center py-2 rounded text-[10px] font-bold border cursor-pointer transition', form.priority === p ? getPriorityStyle(p) : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100']">
                            {{ p === 'low' ? 'B' : p === 'medium' ? 'M' : p === 'high' ? 'A' : 'U' }}
                        </div>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</span>
                        <el-popover v-if="!isViewing" placement="bottom-end" :width="280" trigger="click"
                            :visible="isTagPopoverOpen">
                            <template #reference>
                                <el-button size="small" circle text @click="isTagPopoverOpen = !isTagPopoverOpen">
                                    <el-icon>
                                        <Setting />
                                    </el-icon>
                                </el-button>
                            </template>
                            <div class="p-2">
                                <h4 class="text-xs font-bold text-slate-700 mb-3 pb-2 border-b">{{ editingTagId ?
                                    'Editar Tag' :
                                    'Gerenciar Tags' }}</h4>
                                <div v-if="!editingTagId"
                                    class="space-y-1 mb-4 max-h-48 overflow-y-auto custom-scroll pr-1">
                                    <div v-for="tag in availableTags" :key="tag.id"
                                        class="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 group">
                                        <div class="flex items-center gap-2 cursor-pointer flex-1"
                                            @click="toggleTag(tag.id)">
                                            <el-checkbox :model-value="form.tags.includes(tag.id)" size="small" />
                                            <el-tag size="small" :type="tag.type as any" effect="light"
                                                class="!border-0">{{
                                                tag.name }}</el-tag>
                                        </div>
                                        <div class="opacity-0 group-hover:opacity-100 flex gap-1">
                                            <el-button link size="small" type="primary"
                                                @click.stop="startEditTag(tag)"><el-icon>
                                                    <Edit />
                                                </el-icon></el-button>
                                            <el-button link type="danger" size="small"
                                                @click.stop="deleteTag(tag.id)"><el-icon>
                                                    <Delete />
                                                </el-icon></el-button>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="editingTagId || availableTags.length === 0" class="mb-4">
                                    <el-input v-model="newTagInput" size="small" placeholder="Nome da tag..."
                                        class="mb-2" />
                                    <div class="flex items-center gap-2 mb-3">
                                        <el-select v-model="newTagType" size="small" style="width: 100px">
                                            <el-option value="" label="Cinza" />
                                            <el-option value="success" label="Verde" />
                                            <el-option value="warning" label="Laranja" />
                                            <el-option value="danger" label="Vermelho" />
                                        </el-select>
                                        <el-button v-if="editingTagId" type="success" size="small"
                                            @click="saveEditTag">Salvar</el-button>
                                        <el-button v-else type="primary" size="small"
                                            @click="createTag">Criar</el-button>
                                    </div>
                                </div>
                                <el-button type="primary" class="w-full" size="small"
                                    @click="isTagPopoverOpen = false">Concluir</el-button>
                            </div>
                        </el-popover>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        <el-tag v-for="tagId in form.tags" :key="tagId" :type="getTagName(tagId).type as any" closable
                            @close="toggleTag(tagId)" size="small">{{ getTagName(tagId).name }}</el-tag>
                        <span v-if="form.tags.length === 0" class="text-xs text-slate-400 italic">Sem tags</span>
                    </div>
                </div>

                <div class="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-3">
                    <el-button v-if="!isViewing" type="primary"
                        class="w-full !ml-0 !h-11 !font-bold shadow-lg shadow-blue-100" @click="submit"
                        :loading="loading">
                        SALVAR TICKET
                    </el-button>

                    <el-button v-if="isViewing" type="primary"
                        class="w-full !ml-0 !h-11 !font-bold shadow-lg shadow-blue-100" @click="$emit('switch-edit')">
                        <el-icon class="mr-2">
                            <Edit />
                        </el-icon> EDITAR TICKET
                    </el-button>

                    <el-button class="w-full !ml-0 !h-11 !font-bold" @click="handleClose">
                        FECHAR
                    </el-button>
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { User, Close, Edit, List, Delete, UploadFilled, Setting } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import type { ITicket } from '../../domain/entities/Ticket';
import { TicketStatus } from '../../domain/valueObjects/ticket-status.enum';
import { TicketPriority } from '../../domain/valueObjects/ticket-priority.enum';

const props = defineProps<{
    isOpen: boolean;
    ticket: ITicket | null;
    isViewing?: boolean;
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

// Estados Popover
const isTagPopoverOpen = ref(false);
const editingTagId = ref<string | null>(null);
const newTagInput = ref('');
const newTagType = ref('');

interface ChecklistItem { text: string; done: boolean; }

const form = reactive({
    title: '',
    customer: '',
    status: TicketStatus.OPEN as string,
    priority: TicketPriority.MEDIUM as string,
    description: '',
    assignees: [] as string[],
    tags: [] as string[],
    attachments: [] as any[],
    checklist: [] as ChecklistItem[]
});

const teamMembers = ref([
    { id: '1', name: 'Você' },
    { id: '2', name: 'Atendente Alpha' },
    { id: '3', name: 'Gestor' }
]);

const availableTags = ref([
    { id: 't1', name: 'Financeiro', type: 'success' },
    { id: 't2', name: 'Urgente', type: 'danger' }
]);

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
        }
        activeTab.value = 'main';
    }
});

// Ações Textarea
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

// Ações Attachments
const handleAttachmentChange = (file: UploadFile) => form.attachments.push({ name: file.name, size: file.size || 0, raw: file.raw });
const removeAttachment = (idx: number) => form.attachments.splice(idx, 1);

// Ações Tags
const toggleTag = (id: string) => {
    const idx = form.tags.indexOf(id);
    if (idx === -1) form.tags.push(id);
    else form.tags.splice(idx, 1);
};

const createTag = () => {
    if (!newTagInput.value) return;
    const id = `t${Date.now()}`;
    availableTags.value.push({ id, name: newTagInput.value, type: newTagType.value });
    newTagInput.value = '';
};

const startEditTag = (tag: any) => {
    editingTagId.value = tag.id;
    newTagInput.value = tag.name;
    newTagType.value = tag.type;
};

const saveEditTag = () => {
    const tag = availableTags.value.find(t => t.id === editingTagId.value);
    if (tag) {
        tag.name = newTagInput.value;
        tag.type = newTagType.value;
    }
    cancelEditTag();
};

const cancelEditTag = () => {
    editingTagId.value = null;
    newTagInput.value = '';
};

const deleteTag = (id: string) => {
    availableTags.value = availableTags.value.filter(t => t.id !== id);
    form.tags = form.tags.filter(tid => tid !== id);
};

// Utils & Helpers
const getTagName = (id: string) => availableTags.value.find(t => t.id === id) || { name: '?', type: 'info' };
const getTeamMemberName = (id: string) => teamMembers.value.find(u => u.id === id)?.name || '?';

const getStatusColor = (s: string) => ({
    'open': 'bg-amber-400',
    'in-progress': 'bg-blue-500',
    'resolved': 'bg-green-500'
}[s] || 'bg-slate-400');

const getPriorityStyle = (p: string) => ({
    'low': 'bg-slate-50 text-slate-500',
    'medium': 'bg-blue-50 text-blue-600',
    'high': 'bg-orange-50 text-orange-600',
    'urgent': 'bg-red-50 text-red-600'
}[p] || '');

// Ações Checklist
const addChecklistItem = () => form.checklist.push({ text: '', done: false });
const removeChecklistItem = (idx: number) => form.checklist.splice(idx, 1);

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
.custom-ticket-dialog .el-dialog__header {
    padding: 0;
    margin-right: 0;
}

.custom-ticket-dialog .el-dialog__body {
    padding: 0 !important;
}
</style>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

/* --- ESTILO DA TEXTAREA DE DESCRIÇÃO COM BORDA VISÍVEL --- */
:deep(.description-textarea textarea) {
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    background-color: #f8fafc !important;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    padding: 12px !important;
    color: #475569;
    resize: none;
    transition: all 0.2s ease;
}

:deep(.description-textarea textarea:focus) {
    background-color: #ffffff !important;
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f6 !important;
    outline: none;
}
</style>