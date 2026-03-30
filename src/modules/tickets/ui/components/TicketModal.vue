<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && handleClose()" width="95%"
        style="max-width: 1050px;" align-center destroy-on-close :show-close="false" class="enterprise-ticket-dialog">

        <template #header>
            <div
                class="flex flex-wrap lg:flex-nowrap justify-between items-center w-full px-4 lg:px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl gap-4">
                <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 w-full">
                    <div
                        class="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest shrink-0 border border-slate-200">
                        {{ headerTitle }}
                    </div>
                    <h2 class="text-xl sm:text-2xl font-black text-slate-800 leading-tight truncate max-w-xl"
                        :title="form.title || 'Novo Chamado'">
                        {{ form.title || 'Novo Chamado' }}
                    </h2>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-auto">
                    <el-button circle plain type="danger"
                        class="!bg-slate-50 hover:!bg-red-50 !border-slate-200 hover:!border-red-200"
                        @click="handleClose">
                        <el-icon class="text-slate-500 hover:text-red-500">
                            <Close />
                        </el-icon>
                    </el-button>
                </div>
            </div>
        </template>

        <div class="flex flex-col lg:flex-row h-full min-h-[600px] lg:h-[750px] bg-white w-full">
            <div class="flex-1 flex flex-col min-w-0 border-r border-slate-200/80 bg-white">
                <div class="px-6 py-2 border-b border-slate-100 shrink-0">
                    <el-tabs v-model="activeTab" class="enterprise-tabs">
                        <el-tab-pane name="main">
                            <template #label>
                                <span class="flex items-center gap-2 text-sm font-semibold">
                                    <el-icon>
                                        <Document />
                                    </el-icon> Detalhes
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="checklist">
                            <template #label>
                                <span class="flex items-center gap-2 text-sm font-semibold">
                                    <el-icon>
                                        <Finished />
                                    </el-icon> Subtarefas
                                    <span v-if="form.checklist.length"
                                        class="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                                        {{ form.checklist.length }}
                                    </span>
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="attachments">
                            <template #label>
                                <span class="flex items-center gap-2 text-sm font-semibold">
                                    <el-icon>
                                        <UploadFilled />
                                    </el-icon> Anexos
                                    <span v-if="form.attachments.length"
                                        class="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                                        {{ form.attachments.length }}
                                    </span>
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="chat">
                            <template #label>
                                <span class="flex items-center gap-2 text-sm">
                                    <el-icon>
                                        <ChatLineRound />
                                    </el-icon> Histórico de Atendimento
                                    <span v-if="form.chatHistory.length"
                                        class="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                                        {{ form.chatHistory.length }}
                                    </span>
                                </span>
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                </div>

                <div class="flex-1 overflow-y-auto p-6 custom-scroll bg-slate-50/30">
                    <div v-show="activeTab === 'main'" class="space-y-6 max-w-3xl animate-in fade-in duration-300">

                        <div class="md:col-span-12">
                            <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                Título da Solicitação <span class="text-red-500">*</span>
                            </label>
                            <div :class="{ 'rounded-lg ring-2 ring-red-500 transition-all': formErrors.title }">
                                <el-input v-model="form.title" :disabled="isViewing" size="large"
                                    placeholder="Ex: Erro ao gerar relatório de vendas"
                                    class="enterprise-input font-medium" @input="formErrors.title = false" />
                            </div>
                            <span v-if="formErrors.title"
                                class="text-red-500 text-[10px] font-medium mt-1 block">Obrigatório</span>
                        </div>

                        <div class="pt-4 border-t border-slate-100">
                            <label class="text-[13px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                                <span>Descrição Detalhada do Problema <span class="text-red-500">*</span></span>
                            </label>
                            <div
                                :class="['rounded-xl border transition-all overflow-hidden bg-white flex flex-col', isViewing ? 'border-slate-200 opacity-90' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 shadow-sm', formErrors.description ? 'ring-2 ring-red-500 border-red-500' : '']">
                                <QuillEditor v-if="!isViewing" v-model:content="form.description" contentType="html"
                                    theme="snow" toolbar="full"
                                    placeholder="Descreva o cenário, cole imagens, crie listas..."
                                    @update:content="formErrors.description = false" />
                                <div v-else class="p-5 prose prose-sm max-w-none text-slate-700 min-h-[350px]"
                                    v-safe-html="form.description || '<p class=\'text-slate-400 italic\'>Nenhuma descrição fornecida.</p>'">
                                </div>
                            </div>
                            <span v-if="formErrors.description"
                                class="text-red-500 text-[10px] font-medium mt-1 block">Obrigatório</span>
                        </div>

                    </div>

                    <div v-show="activeTab === 'checklist'"
                        class="max-w-3xl animate-in fade-in duration-300 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <TicketChecklist v-model:items="form.checklist" :readonly="isViewing" />
                    </div>

                    <div v-show="activeTab === 'chat'" class="h-full flex flex-col animate-in fade-in duration-300">
                        <div class="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[400px]">
                            <div v-for="(msg, idx) in form.chatHistory" :key="idx"
                                :class="['flex w-full', msg.isAgent ? 'justify-end' : 'justify-start']">
                                <div
                                    :class="['max-w-[80%] rounded-2xl px-4 py-3 shadow-sm relative', msg.isAgent ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm']">
                                    <div class="flex items-center gap-2 mb-1.5 opacity-80">
                                        <span class="text-[10px] font-black uppercase tracking-wider">{{ msg.sender
                                            }}</span>
                                        <span class="text-[10px]">{{ msg.time }}</span>
                                    </div>
                                    <p class="text-sm font-medium leading-relaxed whitespace-pre-wrap">{{ msg.text }}
                                    </p>
                                </div>
                            </div>

                            <div v-if="form.chatHistory.length === 0"
                                class="flex flex-col items-center justify-center h-full text-slate-400 opacity-70 mt-20">
                                <el-icon :size="48" class="mb-3">
                                    <ChatLineRound />
                                </el-icon>
                                <p class="text-sm font-bold uppercase tracking-widest">Sem mensagens registradas</p>
                            </div>
                        </div>

                        <div v-if="!isViewing" class="mt-4 pt-4 border-t border-slate-200 shrink-0">
                            <div class="flex gap-3 items-end bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                                <el-input v-model="newChatMessage" type="textarea" :rows="2" resize="none"
                                    placeholder="Adicionar nota ou mensagem ao histórico..."
                                    class="custom-transparent-select w-full" />
                                <el-button type="primary" class="!px-5 !h-[50px] !rounded-lg" @click="addChatMessage"
                                    :disabled="!newChatMessage.trim()">
                                    <el-icon :size="18">
                                        <Promotion />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>

                    <div v-show="activeTab === 'attachments'" class="animate-in fade-in duration-300">
                        <div v-if="!isViewing"
                            class="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer mb-6"
                            @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleFileDrop">
                            <el-icon class="text-4xl text-blue-400 mb-3">
                                <UploadFilled />
                            </el-icon>
                            <h4 class="text-sm font-bold text-slate-800 mb-1">Clique ou arraste ficheiros para cá</h4>
                            <p class="text-xs text-slate-500">PDF, JPG, PNG, DOCX (Max 10MB)</p>
                            <input type="file" ref="fileInput" class="hidden" multiple
                                accept=".pdf,.jpg,.jpeg,.png,.docx" @change="handleFileSelected" />
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="(file, idx) in form.attachments" :key="idx"
                                class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-slate-300 transition-colors">
                                <div
                                    class="w-10 h-10 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-slate-200">
                                    {{ file.name.split('.').pop()?.substring(0, 3) }}
                                </div>
                                <div class="flex-1 min-w-0 ml-3">
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
                </div>
            </div>

            <div
                class="w-full lg:w-[350px] bg-slate-50/60 p-5 flex flex-col gap-0 h-auto lg:h-[750px] overflow-y-auto custom-scroll shrink-0 border-l border-slate-200">

                <el-collapse v-model="activeCollapses" class="enterprise-collapse border-none">
                    <el-collapse-item name="routing"
                        class="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/80 [&_.el-collapse-item\_\_header]:!px-5 [&_.el-collapse-item\_\_header]:h-12 [&_.el-collapse-item\_\_wrap]:border-none">
                        <template #title>
                            <span
                                class="font-bold text-slate-700 text-[11px] tracking-widest uppercase flex items-center gap-2.5 ml-1">
                                <el-icon size="16">
                                    <Promotion />
                                </el-icon> Roteamento & Status
                            </span>
                        </template>
                        <div class="p-4 flex flex-col gap-4 border-t border-slate-100">
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Cliente
                                    <span class="text-red-500">*</span></label>
                                <div :class="{ 'rounded-lg ring-2 ring-red-500 transition-all': formErrors.customer }">
                                    <el-select v-model="form.customer" filterable placeholder="Buscar cliente..."
                                        class="w-full enterprise-select" :disabled="isViewing"
                                        @change="formErrors.customer = false">
                                        <template #prefix><el-icon>
                                                <User />
                                            </el-icon></template>
                                        <el-option v-for="client in customerStore.items" :key="client.uuid"
                                            :label="client.tradeName || client.companyName || client.name"
                                            :value="client.tradeName || client.companyName || client.name" />
                                    </el-select>
                                </div>
                                <span v-if="formErrors.customer"
                                    class="text-red-500 text-[10px] font-medium mt-1 block">Obrigatório</span>
                            </div>

                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Fase
                                    Atual</label>
                                <el-select v-model="form.status" class="w-full enterprise-select"
                                    :disabled="isViewing || form.status === 'pending_approval'">
                                    <template #prefix>
                                        <div :class="['w-2 h-2 rounded-full', getStatusColor(form.status)]"></div>
                                    </template>
                                    <el-option v-for="option in statusOptions" :key="option.value" :label="option.label"
                                        :value="option.value" />
                                </el-select>
                            </div>

                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Tipo
                                    de
                                    Solicitação <span class="text-red-500">*</span></label>
                                <div :class="{ 'rounded-lg ring-2 ring-red-500 transition-all': formErrors.type }">
                                    <el-select v-model="form.type" class="w-full enterprise-select"
                                        :disabled="isViewing" @change="formErrors.type = false">
                                        <el-option label="💻 Suporte / Dúvida" value="support" />
                                        <el-option label="🐞 Relato de Bug" value="bug" />
                                        <el-option label="✨ Melhoria" value="feature" />
                                        <el-option label="⚙️ Tarefa Interna" value="internal" />
                                    </el-select>
                                </div>
                                <span v-if="formErrors.type"
                                    class="text-red-500 text-[10px] font-medium mt-1 block">Obrigatório</span>
                            </div>

                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nível
                                    de
                                    Prioridade <span class="text-red-500">*</span></label>
                                <div class="flex flex-wrap gap-1 w-full p-1 rounded-lg transition-all"
                                    :class="[{ 'opacity-75 pointer-events-none': isViewing }, formErrors.priority ? 'bg-red-50 ring-2 ring-red-500' : 'bg-slate-100']">
                                    <div v-for="p in ['low', 'medium', 'high', 'urgent']" :key="p"
                                        @click="form.priority = p; formErrors.priority = false"
                                        :class="['flex-1 min-w-[50px] text-center py-1.5 rounded text-[10px] sm:text-[11px] font-bold cursor-pointer transition-all', form.priority === p ? getPriorityStyle(p) + ' shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50']">
                                        {{ getPriorityName(p) }}
                                    </div>
                                </div>
                                <span v-if="formErrors.priority"
                                    class="text-red-500 text-[10px] font-medium mt-1 block">Obrigatório</span>
                            </div>
                        </div>
                    </el-collapse-item>

                    <el-collapse-item name="sla"
                        class="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/80 [&_.el-collapse-item\_\_header]:!px-5 [&_.el-collapse-item\_\_header]:h-12 [&_.el-collapse-item\_\_wrap]:border-none">
                        <template #title>
                            <span
                                class="font-bold text-slate-700 text-[11px] tracking-widest uppercase flex items-center gap-2.5 ml-1">
                                <el-icon size="16">
                                    <Clock />
                                </el-icon> SLA & Prazos
                            </span>
                        </template>
                        <div class="p-4 flex flex-col gap-4 border-t border-slate-100">
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Data
                                    de
                                    Início</label>
                                <el-date-picker v-model="form.startDate" type="date" placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY" class="!w-full max-w-full" :disabled="isViewing" />
                            </div>
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Previsão
                                    de
                                    Conclusão</label>
                                <el-date-picker v-model="form.endDate" type="date" placeholder="DD/MM/YYYY"
                                    format="DD/MM/YYYY" class="!w-full max-w-full" :disabled="isViewing" />
                            </div>
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Esforço
                                    Estimado (Horas)</label>
                                <el-input-number v-model="form.estimatedHours" :min="0" :step="1" class="w-full"
                                    controls-position="right" :disabled="isViewing" />
                            </div>
                        </div>
                    </el-collapse-item>

                    <el-collapse-item name="team"
                        class="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/80 [&_.el-collapse-item\_\_header]:!px-5 [&_.el-collapse-item\_\_header]:h-12 [&_.el-collapse-item\_\_wrap]:border-none">
                        <template #title>
                            <span
                                class="font-bold text-slate-700 text-[11px] tracking-widest uppercase flex items-center gap-2.5 ml-1">
                                <el-icon size="16">
                                    <User />
                                </el-icon> Equipe & Tags
                            </span>
                        </template>
                        <div class="p-4 flex flex-col gap-4 border-t border-slate-100">
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Equipe
                                    Atribuída</label>
                                <el-select v-model="form.assignees" multiple filterable placeholder="Atribuir..."
                                    class="w-full mb-3 enterprise-select" :disabled="isViewing">
                                    <el-option v-for="user in teamMembers" :key="user.id" :label="user.name"
                                        :value="user.id">
                                        <div class="flex items-center gap-2">
                                            <el-avatar :size="20"
                                                class="bg-blue-100 text-blue-600 font-bold text-[10px]">
                                                {{ user.name.charAt(0).toUpperCase() }}
                                            </el-avatar>
                                            <span>{{ user.name }}</span>
                                        </div>
                                    </el-option>
                                </el-select>

                                <div v-if="form.assignees.length > 0" class="flex flex-col gap-2 mt-3">
                                    <div v-for="id in form.assignees" :key="id"
                                        class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-sm">
                                        <el-avatar :size="24"
                                            class="bg-indigo-100 text-indigo-700 font-bold text-xs shrink-0">
                                            {{ getTeamMemberName(id).charAt(0).toUpperCase() }}
                                        </el-avatar>
                                        <span class="text-xs font-bold text-slate-700 truncate">{{ getTeamMemberName(id)
                                            }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-100">
                                <TicketTagsSelector v-model:selectedTags="form.tags" :readonly="isViewing" />
                            </div>
                        </div>
                    </el-collapse-item>
                </el-collapse>

                <div class="mt-8 lg:mt-auto pt-5 border-t border-slate-200/80 flex flex-col gap-3">
                    <el-button v-if="form.status === 'resolved' || form.status === 'done'" type="success" size="large"
                        plain class="w-full !ml-0 !font-bold" @click="generateKbArticle">
                        <el-icon class="mr-2">
                            <Document />
                        </el-icon>
                        Gerar Base de Conhecimento
                    </el-button>

                    <el-button v-if="form.status === 'pending_approval' && !isViewing && !isKanban" type="success"
                        size="large" class="w-full !ml-0 !font-bold shadow-md shadow-green-200"
                        @click="handleApproveKanban">
                        <el-icon class="mr-2">
                            <Select />
                        </el-icon>
                        Aprovar para Kanban
                    </el-button>

                    <el-button v-if="isViewing" type="primary" size="large" class="w-full !ml-0 !font-bold"
                        @click="$emit('switch-edit')">
                        <el-icon class="mr-2">
                            <Edit />
                        </el-icon>
                        Editar Ticket
                    </el-button>

                    <el-button v-else type="primary" size="large" :loading="loading" class="w-full !ml-0 !font-bold"
                        @click="submit">
                        Salvar Ticket
                    </el-button>
                </div>
            </div>
        </div>
    </el-dialog>

    <ArticleFormModal v-if="isKbModalOpen" :is-open="isKbModalOpen" :article="kbArticleData"
        @close="isKbModalOpen = false" @save="handleSaveKbArticle" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { Close, User, Edit, ChatLineRound, Promotion, UploadFilled, Delete, Document, Calendar, Clock, Select, Finished } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import TicketChecklist from './TicketChecklist.vue';
import TicketTagsSelector from './TicketTagsSelector.vue';
import type { ITicket } from '../../domain/entities/Ticket';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import ArticleFormModal from '@/modules/kb/ui/components/ArticleFormModal.vue';
import { useKbStore } from '@/modules/kb/ui/store/kb.store';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';

const props = defineProps<{
    isOpen: boolean;
    ticket?: ITicket | null;
    isViewing?: boolean;
    initialData?: any;
    isKanban?: boolean; // Propriedade nova para desativar botão extra no Kanban
}>();

const emit = defineEmits(['close', 'save', 'switch-edit', 'approve-kanban']);

const customerStore = useCustomerStore();
const kanbanStore = useKanbanStore();

const activeTab = ref('main');
const loading = ref(false);
const newChatMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const isKbModalOpen = ref(false);
const kbArticleData = ref<any>(null);

const activeCollapses = ref(['routing', 'sla', 'team']);

const headerTitle = computed(() => {
    if (props.isViewing) return `TICKET #${props.ticket?.id}`;
    return props.ticket?.id ? `EDITAR #${props.ticket.id}` : 'NOVO TICKET';
});

const teamMembers = [
    { id: '1', name: 'Admin (Você)' },
    { id: '2', name: 'João Atendimento' },
    { id: '3', name: 'Maria Vendas' }
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
    startDate: null as string | Date | null,
    endDate: null as string | Date | null,
    estimatedHours: null as number | null,
    type: 'support' as 'bug' | 'feature' | 'support' | 'internal',
});

const formErrors = reactive({
    title: false,
    description: false,
    customer: false,
    priority: false,
    type: false
});

const validateForm = () => {
    formErrors.title = !form.title || form.title.trim() === '';

    const plainDesc = form.description ? form.description.replace(/<[^>]*>?/gm, '').trim() : '';
    formErrors.description = !form.description || plainDesc === '';

    formErrors.customer = !form.customer;
    formErrors.priority = !form.priority;
    formErrors.type = !form.type;

    return !formErrors.title && !formErrors.description && !formErrors.customer && !formErrors.priority && !formErrors.type;
};

const translateLabel = (valueToCheck: string, originalLabel: string) => {
    const dict: Record<string, string> = {
        'open': 'Aberto',
        'in_progress': 'Em Andamento',
        'in-progress': 'Em Andamento',
        'waiting': 'Aguardando',
        'aguardando': 'Aguardando',
        'resolved': 'Resolvido',
        'done': 'Finalizado',
        'pending_approval': 'Triagem'
    };
    return dict[valueToCheck] || dict[originalLabel] || originalLabel;
};

const statusOptions = computed(() => {
    const columns = kanbanStore.columns || [];
    const options = columns.map((col: any) => ({
        label: translateLabel(String(col.id), col.title),
        value: String(col.id)
    }));

    if (!options.some((opt: any) => opt.value === 'internal')) {
        options.push({ label: 'Interno', value: 'internal' });
    }

    if (form.status && !options.some((opt: any) => String(opt.value) === String(form.status))) {
        options.push({
            label: translateLabel(String(form.status), String(form.status)),
            value: String(form.status)
        });
    }

    return options;
});

const initForm = () => {
    if (customerStore.items.length === 0) {
        customerStore.fetch();
    }

    if (kanbanStore.columns.length === 0 && typeof kanbanStore.fetchKanbanData === 'function') {
        kanbanStore.fetchKanbanData();
    }

    activeTab.value = 'main';
    newChatMessage.value = '';
    formErrors.title = false;
    formErrors.description = false;
    formErrors.customer = false;
    formErrors.priority = false;
    formErrors.type = false;

    if (props.ticket) {
        form.title = props.ticket.title || '';
        form.customer = props.ticket.customer || '';
        form.description = props.ticket.description || '';

        let st = String(props.ticket.status || 'open');
        if (st === 'in-progress') st = 'in_progress';
        form.status = st;

        form.priority = (props.ticket.priority as unknown as string) || 'low';
        form.assignees = (props.ticket as any).assignees || [];
        form.tags = (props.ticket as any).tags || [];
        form.checklist = (props.ticket as any).checklist || [];
        form.chatHistory = Array.isArray((props.ticket as any).chatHistory) ? [...(props.ticket as any).chatHistory] : [];
        form.attachments = (props.ticket as any).attachments || [];
        form.startDate = props.ticket.startDate || null;
        form.endDate = props.ticket.endDate || null;
        form.estimatedHours = props.ticket.estimatedHours || null;
        form.type = props.ticket.type || 'support';

    } else if (props.initialData) {
        form.title = props.initialData.title || '';
        form.customer = props.initialData.customer || '';
        form.description = props.initialData.description || '';

        let st = String(props.initialData.status || 'pending_approval');
        if (st === 'in-progress') st = 'in_progress';
        form.status = st;

        form.priority = props.initialData.priority || 'low';
        form.assignees = props.initialData.assignees || [];
        form.tags = props.initialData.tags || [];
        form.checklist = props.initialData.checklist || [];
        form.chatHistory = Array.isArray(props.initialData.chatHistory) ? [...props.initialData.chatHistory] : [];
        form.attachments = props.initialData.attachments || [];
        form.startDate = props.initialData.startDate || null;
        form.endDate = props.initialData.endDate || null;
        form.estimatedHours = props.initialData.estimatedHours || null;
        form.type = props.initialData.type || 'support';

        if (form.chatHistory.length > 0) activeTab.value = 'chat';

    } else {
        form.title = '';
        form.customer = '';
        form.description = '';
        form.status = 'pending_approval';
        form.priority = 'low';
        form.assignees = [];
        form.tags = [];
        form.checklist = [];
        form.chatHistory = [];
        form.attachments = [];
        form.startDate = null;
        form.endDate = null;
        form.estimatedHours = null;
        form.type = 'support';
    }
};

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        initForm();
    }
}, { immediate: true });

const generateKbArticle = () => {
    const ticketContent = form.description || '<p>Nenhuma descrição fornecida.</p>';
    const finalHtmlContent = `
    <p><strong>Problema/Solicitação Original:</strong></p>
    ${ticketContent}
    <br/>
    <p><strong>Resolução/Passos de Solução:</strong></p>
    <p><em>Escreva aqui os passos aplicados...</em></p>
  `.trim();

    kbArticleData.value = {
        title: `[Resolução] ${form.title}`,
        content: finalHtmlContent,
        category: 'Tutorial',
        status: 'Rascunho',
        icon: 'Document'
    };
    isKbModalOpen.value = true;
};

const handleSaveKbArticle = async (data: any) => {
    const kbStore = useKbStore();
    await kbStore.saveArticle(data);
    isKbModalOpen.value = false;
};

const getTeamMemberName = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    return member ? member.name : 'User';
};

const handleClose = () => {
    formErrors.title = false;
    formErrors.description = false;
    formErrors.customer = false;
    formErrors.priority = false;
    formErrors.type = false;
    emit('close');
};

const submit = async () => {
    if (!validateForm()) {
        ElMessage.warning("Por favor, verifique os campos obrigatórios em destaque vermelho.");

        // Força a navegação para a aba "Detalhes" caso falte Titulo ou Descrição
        if (formErrors.title || formErrors.description) {
            activeTab.value = 'main';
        }
        // Abre a aba do canto direito se faltar as métricas de roteamento
        if (formErrors.customer || formErrors.priority || formErrors.type) {
            if (!activeCollapses.value.includes('routing')) {
                activeCollapses.value.push('routing');
            }
        }
        return;
    }

    loading.value = true;
    try {
        const payload = { ...form };

        if (props.ticket?.id) {
            (payload as any).id = props.ticket.id;
        } else if (props.initialData?.id) {
            (payload as any).id = props.initialData.id;
        }

        if (payload.assignees && payload.assignees.length > 0) {
            const firstAssignee = teamMembers.find(m => m.id === payload.assignees[0]);
            if (firstAssignee) {
                (payload as any).assigneeName = firstAssignee.name;
            }
        } else {
            (payload as any).assigneeName = null;
        }

        if (typeof kanbanStore.saveBoard === 'function') {
            kanbanStore.saveBoard();
        }

        emit('save', payload);
    } catch (error) {
        console.error("Erro ao salvar o ticket:", error);
        ElMessage.error("Erro ao salvar o ticket. Tente novamente.");
    } finally {
        loading.value = false;
    }
};

const handleApproveKanban = async () => {
    if (!validateForm()) {
        ElMessage.warning("Por favor, preencha os campos obrigatórios em Roteamento & Status antes de aprovar.");
        if (!activeCollapses.value.includes('routing')) {
            activeCollapses.value.push('routing');
        }
        return;
    }
    emit('approve-kanban', { ...form, id: props.ticket?.id });
};

const addChatMessage = () => {
    if (!newChatMessage.value.trim()) return;
    form.chatHistory.push({
        text: newChatMessage.value,
        sender: 'Admin (Você)',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isAgent: true
    });
    newChatMessage.value = '';
};

const triggerFileUpload = () => {
    fileInput.value?.click();
};

const handleFileDrop = (e: DragEvent) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
        processFiles(files);
    }
};

const handleFileSelected = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        processFiles(target.files);
    }
};

const processFiles = (files: FileList) => {
    const maxSizeBytes = 10 * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        if (file.size > maxSizeBytes) {
            ElMessage.warning(`Ficheiro ${file.name} excede o limite de 10MB.`);
            continue;
        }

        form.attachments.push({
            name: file.name,
            size: file.size,
            type: file.type,
            raw: file
        });
    }
};

const removeAttachment = (idx: number) => {
    form.attachments.splice(idx, 1);
};

const getStatusColor = (status: string) => {
    if (status === 'resolved' || status === 'done') return 'bg-green-500';
    if (status === 'in_progress' || status === 'in-progress') return 'bg-blue-500';
    if (status === 'waiting' || status === 'pending_approval') return 'bg-amber-500';
    return 'bg-slate-400';
};

const getPriorityName = (p: string) => {
    const map: Record<string, string> = {
        'low': 'Baixa',
        'medium': 'Média',
        'high': 'Alta',
        'urgent': 'Urgente'
    };
    return map[p] || p;
};

const getPriorityStyle = (p: string) => {
    const map: Record<string, string> = {
        'low': 'bg-white text-slate-700',
        'medium': 'bg-blue-50 text-blue-700',
        'high': 'bg-orange-50 text-orange-700',
        'urgent': 'bg-red-50 text-red-700'
    };
    return map[p] || 'bg-slate-100 text-slate-700';
};
</script>

<style>
.enterprise-ticket-dialog .el-dialog__header {
    display: none !important;
}

.enterprise-ticket-dialog .el-dialog__body {
    padding: 0 !important;
}

.enterprise-tabs .el-tabs__item {
    font-size: 13px;
    color: #64748b;
    font-weight: 700;
    height: 48px;
}

.enterprise-tabs .el-tabs__item.is-active {
    color: #3b82f6;
}

.enterprise-tabs .el-tabs__active-bar {
    background-color: #3b82f6;
    height: 3px;
    border-radius: 3px 3px 0 0;
}

.enterprise-tabs .el-tabs__nav-wrap::after {
    background-color: #f1f5f9;
    height: 1px;
}

.enterprise-input .el-input__wrapper,
.enterprise-select .el-select__wrapper {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px;
    background-color: #f8fafc;
    transition: all 0.2s;
}

.enterprise-input .el-input__wrapper.is-focus,
.enterprise-select .el-select__wrapper.is-focus {
    background-color: #ffffff;
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.custom-transparent-select .el-textarea__inner {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    font-size: 14px;
    color: #334155;
    resize: none;
}

.custom-transparent-select .el-textarea__inner:focus {
    outline: none !important;
    box-shadow: none !important;
}

.custom-transparent-select .el-textarea__inner::placeholder {
    color: #94a3b8;
    font-weight: 500;
}

.enterprise-collapse .el-collapse-item__header {
    font-size: 12px;
    color: #475569;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}

.enterprise-ticket-dialog .ql-toolbar.ql-snow {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f1f5f9;
    font-family: inherit;
    border-radius: 8px 8px 0 0;
    padding: 8px;
}

.enterprise-ticket-dialog .ql-container.ql-snow {
    border: none;
    font-family: inherit;
    font-size: 14px;
    min-height: 350px;
}

.enterprise-ticket-dialog .ql-editor {
    min-height: 350px;
    max-height: 600px;
    overflow-y: auto;
    color: #334155;
    padding: 1rem;
    line-height: 1.6;
}

.enterprise-ticket-dialog .ql-editor.ql-blank::before {
    font-style: normal;
    color: #94a3b8;
}
</style>