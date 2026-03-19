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
                    <el-button v-if="isViewing" type="primary" plain class="!font-bold hover:shadow-sm"
                        @click="$emit('switch-edit')">
                        <el-icon class="mr-1">
                            <Edit />
                        </el-icon> Editar
                    </el-button>
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
                                <span class="flex items-center gap-2 text-sm">
                                    <el-icon>
                                        <Document />
                                    </el-icon>
                                    Informações do Ticket
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="chat">
                            <template #label>
                                <span class="flex items-center gap-2 text-sm">
                                    <el-icon>
                                        <ChatLineRound />
                                    </el-icon>
                                    Histórico de Atendimento
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

                        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div class="md:col-span-12">
                                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Título da Solicitação <span class="text-red-500">*</span>
                                </label>
                                <el-input v-model="form.title" :disabled="isViewing" size="large"
                                    placeholder="Ex: Erro ao gerar relatório de vendas"
                                    class="enterprise-input font-medium" />
                            </div>

                            <div class="md:col-span-12">
                                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                    Cliente / Empresa Solicitante <span class="text-red-500">*</span>
                                </label>
                                <el-select v-model="form.customer" filterable placeholder="Buscar cliente na base..."
                                    class="w-full enterprise-select" size="large" :disabled="isViewing">
                                    <template #prefix>
                                        <el-icon>
                                            <User />
                                        </el-icon>
                                    </template>
                                    <el-option v-for="client in customerStore.items" :key="client.uuid"
                                        :label="client.tradeName || client.companyName || client.name"
                                        :value="client.tradeName || client.companyName || client.name" />
                                </el-select>
                            </div>
                        </div>

                        <div>
                            <label class="text-[13px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                                <span>Descrição Detalhada do Problema</span>
                            </label>
                            <div
                                :class="['rounded-xl border transition-all overflow-hidden bg-white flex flex-col', isViewing ? 'border-slate-200 opacity-90' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 shadow-sm']">
                                <QuillEditor v-if="!isViewing" v-model:content="form.description" contentType="html"
                                    theme="snow" toolbar="full"
                                    placeholder="Descreva o cenário, cole imagens, crie listas..." />
                                <div v-else class="p-5 prose prose-sm max-w-none text-slate-700 min-h-[350px]"
                                    v-html="form.description || '<p class=\'text-slate-400 italic\'>Nenhuma descrição fornecida.</p>'">
                                </div>
                            </div>
                        </div>

                        <TicketChecklist v-model:items="form.checklist" :readonly="isViewing" />

                    </div>

                    <div v-show="activeTab === 'chat'" class="h-full flex flex-col animate-in fade-in duration-300">
                        <div class="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[400px]">
                            <div v-for="(msg, idx) in form.chatHistory" :key="idx"
                                :class="['flex w-full', msg.isAgent ? 'justify-end' : 'justify-start']">
                                <div :class="[
                                    'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm relative',
                                    msg.isAgent ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                                ]">
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
                            class="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer mb-6">
                            <el-icon class="text-4xl text-blue-400 mb-3">
                                <UploadFilled />
                            </el-icon>
                            <h4 class="text-sm font-bold text-slate-800 mb-1">Clique ou arraste ficheiros para cá</h4>
                            <p class="text-xs text-slate-500">PDF, JPG, PNG, DOCX (Max 10MB)</p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div v-for="(file, idx) in form.attachments" :key="idx"
                                class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-slate-300 transition-colors">
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
                        <el-option label="Em Andamento" value="in-progress" />
                        <el-option label="Em Andamento" value="in_progress" style="display: none;" />
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

                <div class="mt-8 lg:mt-auto pt-5 border-t border-slate-200/80 flex flex-col gap-3">

                    <el-button v-if="form.status === 'resolved'" type="success" size="large" plain
                        class="w-full !ml-0 !font-bold" @click="generateKbArticle">
                        <el-icon class="mr-2">
                            <Document />
                        </el-icon>
                        Gerar Base de Conhecimento
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
import { Close, User, Edit, ChatLineRound, Promotion, UploadFilled, Delete, Document } from '@element-plus/icons-vue';
import { ElMessage, type UploadFile } from 'element-plus';

import TicketChecklist from './TicketChecklist.vue';
import TicketTagsSelector from './TicketTagsSelector.vue';
import type { ITicket } from '../../domain/entities/Ticket';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

// Importando os componentes da Base de Conhecimento localmente
import ArticleFormModal from '@/modules/kb/ui/components/ArticleFormModal.vue';
import { useKbStore } from '@/modules/kb/ui/store/kb.store';

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

// Variáveis de controle do Modal KB
const isKbModalOpen = ref(false);
const kbArticleData = ref<any>(null);

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

        let st = (props.ticket.status as unknown as string) || 'open';
        if (st === 'in_progress') st = 'in-progress';
        form.status = st;

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

        let st = props.initialData.status || 'open';
        if (st === 'in_progress') st = 'in-progress';
        form.status = st;

        form.priority = props.initialData.priority || 'low';
        form.assignees = props.initialData.assignees || [];
        form.tags = props.initialData.tags || [];
        form.checklist = props.initialData.checklist || [];
        form.chatHistory = Array.isArray(props.initialData.chatHistory) ? [...props.initialData.chatHistory] : [];
        form.attachments = props.initialData.attachments || [];

        if (form.chatHistory.length > 0) activeTab.value = 'chat';
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

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        initForm();
    }
});

// A LÓGICA DE ABRIR A BASE DE CONHECIMENTO RETORNOU PARA CÁ
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

// SALVANDO E FECHANDO O MODAL DA BASE DE CONHECIMENTO
const handleSaveKbArticle = async (data: any) => {
    const kbStore = useKbStore();
    await kbStore.saveArticle(data, data.id);
    isKbModalOpen.value = false;
    ElMessage.success('Artigo gerado com sucesso na Base de Conhecimento!');
};

const handleClose = () => {
    emit('close');
};

const submit = () => {
    if (!form.title.trim() || !form.customer) {
        ElMessage.warning('Preencha os campos obrigatórios (Título e Cliente).');
        return;
    }

    loading.value = true;
    setTimeout(() => {
        emit('save', {
            id: props.ticket?.id,
            ...form,
            createdAt: props.ticket?.createdAt || new Date()
        });
        loading.value = false;
    }, 400);
};

const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
        'open': 'bg-amber-500',
        'in-progress': 'bg-blue-500',
        'in_progress': 'bg-blue-500',
        'resolved': 'bg-green-500'
    };
    return map[status] || 'bg-slate-400';
};

const getPriorityName = (p: string) => {
    const map: Record<string, string> = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta', 'urgent': 'Urgente' };
    return map[p] || p;
};

const getPriorityStyle = (p: string) => {
    const map: Record<string, string> = {
        'low': 'bg-slate-100 text-slate-700',
        'medium': 'bg-blue-100 text-blue-700',
        'high': 'bg-amber-100 text-amber-700',
        'urgent': 'bg-red-100 text-red-700'
    };
    return map[p] || 'bg-slate-100 text-slate-700';
};

const getTeamMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || 'User';

const addChatMessage = () => {
    if (!newChatMessage.value.trim()) return;
    form.chatHistory.push({
        sender: 'Você (Agente)',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        text: newChatMessage.value.trim(),
        isAgent: true
    });
    newChatMessage.value = '';
};

const removeAttachment = (index: number) => {
    form.attachments.splice(index, 1);
};
</script>

<style scoped>
:deep(.enterprise-ticket-dialog .el-dialog__header) {
    padding: 0;
    margin-right: 0;
    border-bottom: none;
}

:deep(.enterprise-ticket-dialog .el-dialog__body) {
    padding: 0;
    background-color: #f8fafc;
}

:deep(.enterprise-tabs .el-tabs__header) {
    margin-bottom: 0;
}

:deep(.enterprise-tabs .el-tabs__item) {
    font-weight: 600;
    color: #64748b;
    height: 48px;
    line-height: 48px;
}

:deep(.enterprise-tabs .el-tabs__item.is-active) {
    color: #2563eb;
}

:deep(.enterprise-tabs .el-tabs__nav-wrap::after) {
    display: none;
}

:deep(.enterprise-input .el-input__wrapper) {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px #cbd5e1 inset;
    border-radius: 0.5rem;
    background-color: #ffffff;
}

:deep(.enterprise-input .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #3b82f6 inset;
}

:deep(.enterprise-select .el-select__wrapper) {
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px #cbd5e1 inset;
    border-radius: 0.5rem;
    background-color: #ffffff;
}

:deep(.enterprise-select .el-select__wrapper.is-focused) {
    box-shadow: 0 0 0 2px #3b82f6 inset;
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
    background-color: #f1f5f9;
    font-family: inherit;
    border-radius: 8px 8px 0 0;
    padding: 12px;
}

:deep(.ql-container.ql-snow) {
    border: none;
    font-family: inherit;
    font-size: 14px;
    min-height: 350px;
}

:deep(.ql-editor) {
    min-height: 350px;
    color: #334155;
    padding: 1.25rem;
    line-height: 1.6;
}

:deep(.ql-editor.ql-blank::before) {
    font-style: normal;
    color: #94a3b8;
}
</style>