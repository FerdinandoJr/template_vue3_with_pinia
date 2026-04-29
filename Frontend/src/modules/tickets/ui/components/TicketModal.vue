<template>
  <el-dialog :model-value="isOpen" @update:model-value="!$event && handleClose()" width="95%" style="max-width: 1050px;"
    align-center destroy-on-close :show-close="false" :close-on-click-modal="false" class="enterprise-ticket-dialog" append-to-body>
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
            class="!bg-slate-50 hover:!bg-red-50 !border-slate-200 hover:!border-red-200" @click="handleClose">
            <el-icon class="text-slate-500 hover:text-red-500">
              <Close />
            </el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <div class="flex flex-col lg:flex-row h-[75vh] min-h-[500px] bg-slate-50 relative">
      <div class="flex-1 flex flex-col h-full overflow-hidden bg-white relative z-10">
        <el-tabs v-model="activeTab" class="enterprise-tabs px-4 lg:px-6 pt-4 shrink-0 border-b border-slate-100">
          <el-tab-pane name="main">
            <template #label>
              <span class="flex items-center gap-2 px-1">
                <el-icon>
                  <Document />
                </el-icon> Detalhes
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="chat" v-if="form.whatsappHistory && form.whatsappHistory.length > 0">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative text-emerald-600">
                <el-icon>
                  <ChatDotRound />
                </el-icon> Histórico do Chat
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="checklist">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative">
                <el-icon>
                  <Finished />
                </el-icon> Checklist
                <span v-if="form.checklist.length > 0"
                  class="absolute -top-1 -right-3 w-4 h-4 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {{ form.checklist.length }}
                </span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="notes" v-if="isEditing">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative">
                <el-icon>
                  <Notebook />
                </el-icon> Notas Internas
                <span v-if="form.internalNotes.length > 0"
                  class="absolute -top-1 -right-3 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                  {{ form.internalNotes.length }}
                </span>
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="attachments">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative">
                <el-icon>
                  <Paperclip />
                </el-icon> Anexos
                <span v-if="form.attachments.length > 0"
                  class="absolute -top-1 -right-3 w-4 h-4 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {{ form.attachments.length }}
                </span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <div class="flex-1 overflow-y-auto custom-scroll p-0 bg-[#f8fafc]">
          <div v-show="activeTab === 'main'" class="h-full flex flex-col p-4 lg:p-6 animate-in fade-in duration-300">
            <div class="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
                :class="{ 'ring-1 ring-red-500 border-red-500 bg-red-50': formErrors.title }">
                <label
                  class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <el-icon>
                    <EditPen />
                  </el-icon> Título Breve <span v-if="formErrors.title" class="text-red-500">* Requerido</span>
                </label>
                <el-input v-model="form.title" placeholder="Descreva em poucas palavras..."
                  class="!text-lg font-medium enterprise-input" @input="formErrors.title = false" />
              </div>
              <div class="bg-white p-0 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
                :class="{ 'ring-1 ring-red-500 border-red-500': formErrors.description }">
                <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                  <label
                    class="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <el-icon>
                      <Document />
                    </el-icon> Descrição Detalhada <span v-if="formErrors.description" class="text-red-500">* Requerido</span>
                  </label>
                </div>
                <div class="p-2 flex-1">
                  <RichTextEditor v-model="form.description"
                    placeholder="Descreva todos os detalhes, anexe prints e organize em tópicos..."
                    @update:modelValue="formErrors.description = false" />
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'chat'" class="h-full flex flex-col w-full bg-[#efeae2] relative overflow-hidden">
            <div class="absolute inset-0 opacity-[0.06] pointer-events-none"
              style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-repeat: repeat;">
            </div>
            <div
              class="flex-1 overflow-y-auto p-4 custom-scroll space-y-3 relative z-10 flex flex-col max-w-4xl mx-auto w-full">
              <div class="flex justify-center mb-4 mt-2">
                <span class="bg-white/80 text-slate-500 text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm">Histórico
                  do
                  Atendimento</span>
              </div>
              <div v-for="(msg, index) in form.whatsappHistory" :key="index" class="flex"
                :class="msg.isAgent ? 'justify-end' : 'justify-start'">
                <div class="max-w-[85%] md:max-w-[65%] p-2 rounded-lg shadow-sm relative"
                  :class="msg.isAgent ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'">
                  <div v-if="!msg.isAgent"
                    class="absolute -left-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-white border-r-white">
                  </div>
                  <div v-if="msg.isAgent"
                    class="absolute -right-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-[#d9fdd3] border-l-[#d9fdd3]">
                  </div>
                  <div v-if="!msg.isAgent" class="text-[11px] font-black text-emerald-600 mb-0.5 px-1 tracking-tight">
                    {{ msg.sender || getCustomerNameById(form.customerId) }}
                  </div>
                  <div class="text-[14px] text-[#111b21] leading-relaxed px-1 pb-3 whitespace-pre-wrap font-medium">
                    {{ msg.text }}
                  </div>
                  <div class="text-[10px] text-slate-400 absolute bottom-1 right-2 flex items-center gap-1 font-bold">
                    {{ msg.time }}
                    <el-icon v-if="msg.isAgent" class="text-blue-500 text-[12px]">
                      <Check />
                    </el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'checklist'"
            class="h-full flex flex-col p-4 lg:p-6 animate-in fade-in duration-300">
            <div class="max-w-4xl mx-auto w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
              <div class="mb-6 border-b border-slate-100 pb-4">
                <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
                  <el-icon class="text-blue-500">
                    <Finished />
                  </el-icon> Tarefas e Sub-itens
                </h3>
              </div>
              <TicketChecklist v-model:items="form.checklist" :readonly="false" class="w-full" />
            </div>
          </div>

          <div v-show="activeTab === 'notes'" class="h-full flex flex-col p-4 lg:p-6">
            <div
              class="h-full flex flex-col max-w-4xl mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div class="p-3 border-b border-slate-100 bg-amber-50/50 flex items-center gap-2">
                <el-icon class="text-amber-500 text-lg">
                  <Notebook />
                </el-icon>
                <span class="text-xs font-bold text-amber-700">Área restrita. O cliente não visualiza as notas
                  adicionadas
                  aqui.</span>
              </div>
              <div class="flex-1 overflow-y-auto p-4 custom-scroll space-y-4 bg-slate-50/50">
                <div v-for="(note, index) in form.internalNotes" :key="index"
                  class="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                  <el-avatar :size="32" class="bg-amber-500 text-white shrink-0 font-bold shadow-sm">
                    {{ note.sender.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <div class="flex flex-col items-end">
                    <div class="flex items-center gap-2 mb-1 px-1">
                      <span class="text-xs font-bold text-slate-700">{{ note.sender }}</span>
                      <span class="text-[10px] font-black text-slate-400">{{ note.time }}</span>
                    </div>
                    <div
                      class="p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-amber-100/50 border border-amber-200 text-amber-900 rounded-tr-none font-medium">
                      {{ note.text }}
                    </div>
                  </div>
                </div>
                <div v-if="form.internalNotes.length === 0"
                  class="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <el-icon class="text-5xl opacity-50">
                    <EditPen />
                  </el-icon>
                  <p class="font-medium text-sm">Nenhuma nota interna registrada.</p>
                </div>
              </div>
              <div class="p-3 bg-white border-t border-slate-200">
                <div class="flex gap-2 items-end">
                  <el-input v-model="newNoteMessage" type="textarea" :rows="2"
                    placeholder="Adicionar uma nota de resolução interna..." class="custom-transparent-select"
                    resize="none" @keyup.enter.prevent="addInternalNote" />
                  <el-button type="warning" circle
                    class="mb-1 !w-10 !h-10 !bg-amber-500 hover:!bg-amber-600 !border-none shadow-md"
                    @click="addInternalNote" :disabled="!newNoteMessage.trim()">
                    <el-icon>
                      <Position />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'attachments'" class="p-4 lg:p-6 animate-in fade-in duration-300">
            <div class="max-w-4xl mx-auto w-full">
              <div
                class="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors mb-6 group"
                @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleFileDrop">
                <el-icon class="text-4xl text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <UploadFilled />
                </el-icon>
                <h3 class="font-bold text-slate-700 mb-1">Clique para anexar ou arraste arquivos</h3>
                <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelected" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" v-if="form.attachments.length > 0">
                <div v-for="(file, idx) in form.attachments" :key="idx"
                  class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors group">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <el-icon class="text-slate-500 text-lg">
                        <Document />
                      </el-icon>
                    </div>
                    <div class="truncate">
                      <p class="text-sm font-bold text-slate-700 truncate">{{ file.name }}</p>
                    </div>
                  </div>
                  <el-button type="danger" circle plain size="small"
                    class="opacity-0 group-hover:opacity-100 transition-opacity" @click="removeAttachment(idx)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="w-full lg:w-[340px] xl:w-[380px] bg-slate-50 border-l border-slate-200 flex flex-col h-[50vh] lg:h-full shrink-0 relative z-20">
        <div class="flex-1 overflow-y-auto custom-scroll p-4 lg:p-5">
          <el-collapse v-model="activeCollapses" class="enterprise-collapse border-none gap-4 flex flex-col">
            <el-collapse-item name="routing"
              class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/50 [&_.el-collapse-item\_\_header]:px-4 [&_.el-collapse-item\_\_wrap]:border-none">
              <template #title>
                <div class="font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 text-[11px]">
                  <el-icon>
                    <Guide />
                  </el-icon> Roteamento & Status
                  <div v-if="formErrors.customer || formErrors.priority || formErrors.type"
                    class="w-2 h-2 rounded-full bg-red-500 ml-2 animate-pulse"></div>
                </div>
              </template>
              <div class="p-4 space-y-4">
                <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
                  :class="{ 'ring-1 ring-red-500 border-red-500 bg-red-50': formErrors.customer }">
                  <label
                    class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                    Cliente / Contato <span v-if="formErrors.customer" class="text-red-500">* Requerido</span>
                  </label>
                  <el-select v-model="form.customerId" placeholder="Selecione o Cliente" filterable allow-create
                    class="w-full enterprise-select" @change="formErrors.customer = false">
                    <template #prefix><el-icon>
                        <User />
                      </el-icon></template>
                    <el-option v-for="customer in customerStore.items" :key="customer.id" 
                      :label="getCustomerLabel(customer)" 
                      :value="customer.id" />
                  </el-select>
                </div>

                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Quadro
                    Kanban</label>
                  <el-select v-model="form.boardId" class="w-full enterprise-select" @change="onBoardChange">
                    <template #prefix><el-icon>
                        <DataBoard />
                      </el-icon></template>
                    <el-option v-for="board in kanbanStore.boards" :key="board.id" :label="board.title"
                      :value="board.id" />
                  </el-select>
                </div>

                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fila /
                    Status</label>
                  <el-select v-model="form.status" class="w-full enterprise-select" :disabled="!canApprove && props.isKanban">
                    <template #prefix>
                      <div class="w-2 h-2 rounded-full" :class="getStatusColor(form.status)"></div>
                    </template>
                    <el-option v-for="col in availableColumns" :key="col.id" :label="col.title" :value="col.title">
                      <div class="flex items-center gap-2 font-medium">
                        <span class="w-2 h-2 rounded-full" :class="col.color?.split(' ')[0] || 'bg-slate-400'"></span>
                        {{ col.title }}
                      </div>
                    </el-option>
                  </el-select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                      Prioridade </label>
                    <el-select v-model="form.priority" class="w-full enterprise-select"
                      @change="formErrors.priority = false">
                      <el-option label="Baixa" value="low"> <span class="font-medium text-slate-500">Baixa</span>
                      </el-option>
                      <el-option label="Média" value="medium"> <span class="font-bold text-blue-500">Média</span>
                      </el-option>
                      <el-option label="Alta" value="high"> <span class="font-bold text-orange-500">Alta</span>
                      </el-option>
                      <el-option label="Urgente" value="urgent"> <span class="font-black text-red-600">Urgente</span>
                      </el-option>
                    </el-select>
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                      Categoria </label>
                    <el-select v-model="form.type" class="w-full enterprise-select" @change="formErrors.type = false">
                      <el-option label="Suporte" value="support" />
                      <el-option label="Bug" value="bug" />
                      <el-option label="Melhoria" value="feature" />
                      <el-option label="Interno" value="internal" />
                    </el-select>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-slate-100">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tempo
                    Estimado
                    (Horas)</label>
                  <el-input-number v-model="form.estimatedHours" :min="0.5" :step="0.5" class="w-full enterprise-input"
                    placeholder="Ex: 2.0" />
                </div>

              </div>
            </el-collapse-item>

            <el-collapse-item name="assignment"
              class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/50 [&_.el-collapse-item\_\_header]:px-4 [&_.el-collapse-item\_\_wrap]:border-none">
              <template #title>
                <span class="font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 text-[11px]">
                  <el-icon>
                    <Avatar />
                  </el-icon> Equipe
                </span>
              </template>
              <div class="p-4">
                <el-select v-model="form.assignees" multiple filterable placeholder="Atribuir membros..."
                  class="w-full enterprise-select mb-3">
                  <el-option v-for="user in teamMembers" :key="user.id" :label="user.name" :value="user.id">
                    <div class="flex items-center gap-2 font-medium">
                      <el-avatar :size="20" class="bg-slate-200 text-slate-600 text-[10px]">{{ user.name.charAt(0)
                        }}</el-avatar>
                      <span>{{ user.name }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </el-collapse-item>

            <TicketTagsSelector v-model:selectedTags="form.tags" :readonly="false" class="px-2" />
          </el-collapse>
        </div>

        <div
          class="p-4 bg-white border-t border-slate-200 flex flex-col gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-30">
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
            <el-button @click="handleClose" size="large" class="w-full sm:flex-1 !rounded-xl !h-12 !font-bold"> Cancelar
            </el-button>
            <el-button type="success" size="large" :loading="loading" @click="handleApprove"
              v-if="canApprove && (ticket?.status === 'Pendente' || ticket?.status === 'open' || form.status === 'Pendente')"
              class="w-full sm:flex-1 !rounded-xl !h-12 !font-black tracking-wide shadow-md">
              <el-icon class="mr-2"><Check /></el-icon> Aprovar
            </el-button>
            <el-button type="primary" size="large" :loading="loading" @click="submit"
              class="w-full sm:flex-1 !bg-blue-600 hover:!bg-blue-700 !border-none !rounded-xl !h-12 !font-black tracking-wide shadow-md shadow-blue-200">
              <el-icon class="mr-2">
                <Check />
              </el-icon> Salvar
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Guide, EditPen, User, Select, Close, ChatDotRound, Paperclip, UploadFilled, Delete, Position, Warning, Check, Avatar, Notebook, Lock, Finished, DataBoard } from '@element-plus/icons-vue';
import type { ITicket } from '../../domain/entities/Ticket';
import TicketChecklist from './TicketChecklist.vue';
import TicketTagsSelector from './TicketTagsSelector.vue';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { useCalendarStore } from '@/modules/calendar/ui/store/calendar.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import RichTextEditor from '@/components/RichTextEditor.vue';

const props = defineProps<{
  isOpen: boolean;
  ticket?: ITicket | null | any;
  initialData?: any;
  isViewing?: boolean;
  isKanban?: boolean;
}>();

const emit = defineEmits(['close', 'save', 'switch-edit', 'approve-kanban']);

const kanbanStore = useKanbanStore() as any;
const customerStore = useCustomerStore() as any;
const calendarStore = useCalendarStore() as any;
const authStore = useAuthStore() as any;

const canApprove = computed(() => authStore.hasRole(['Desenvolvedor', 'Gerente', 'Administrador']));

const loading = ref(false);
const activeTab = ref('main');
const activeCollapses = ref(['routing', 'assignment', 'planning']);
const newNoteMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const form = reactive<any>({
  boardId: '',
  status: 'Pendente',
  title: '',
  priority: 'low',
  type: 'support',
  customerId: '',
  assignees: [],
  tags: [],
  checklist: [],
  internalNotes: [],
  attachments: [],
  whatsappHistory: [],
  startDate: '',
  endDate: '',
  estimatedHours: 2
});

const formErrors = reactive({ title: false, description: false, customer: false, priority: false, type: false });

const getDisplayId = (ticket: any) => {
  if (ticket?.ticketNumber) return ticket.ticketNumber;
  if (ticket?.id) return `TKT-${ticket.id.slice(0, 8).toUpperCase()}`;
  return 'Novo';
};

const headerTitle = computed(() => {
  if (props.ticket?.id) return getDisplayId(props.ticket);
  return 'Novo Chamado';
});

const isEditing = computed(() => !!props.ticket?.id);

const teamMembers = computed(() => {
  if (calendarStore.availableUsers && calendarStore.availableUsers.length > 0) {
    return calendarStore.availableUsers;
  }
  return [];
});

const getTeamMemberName = (id: string | number) => {
  const member = teamMembers.value.find((m: any) => String(m.id) === String(id));
  return member ? member.name : String(id);
};

const availableColumns = computed(() => {
  if (!kanbanStore.boards || kanbanStore.boards.length === 0) return kanbanStore.columns || [];
  const board = kanbanStore.boards.find((b: any) => String(b.id) === String(form.boardId));
  return board ? board.columns : (kanbanStore.columns || []);
});

const hasPendingApprovalCol = computed(() => {
  return availableColumns.value.some((c: any) => 
    c.title?.toLowerCase().includes('pendente')
  );
});

const onBoardChange = () => {
  const cols = availableColumns.value;
  let newStatus = form.status;
  
  if (!newStatus || !cols.some((c: any) => c.title === newStatus)) {
    newStatus = canApprove 
      ? (cols.find((c: any) => c.title.toLowerCase().includes('fazer'))?.title || cols[1]?.title || cols[0]?.title)
      : (cols.find((c: any) => c.title.toLowerCase().includes('pendente'))?.title || cols[0]?.title);
  }
  form.status = newStatus;
};

watch(() => props.isOpen, async (isOpen, prevIsOpen) => {
  if (isOpen && !prevIsOpen) {
    Object.keys(formErrors).forEach(k => (formErrors as any)[k] = false);
    activeTab.value = 'main';
    
    const defaultStatus = canApprove 
      ? (kanbanStore.columns?.find((c: any) => c.title.toLowerCase().includes('fazer'))?.title || kanbanStore.columns?.[1]?.title || kanbanStore.columns?.[0]?.title || 'A Fazer')
      : (kanbanStore.columns?.find((c: any) => c.title.toLowerCase().includes('pendente'))?.title || kanbanStore.columns?.[0]?.title || 'Pendente');
    
    if (customerStore.items?.length === 0) {
      await customerStore.fetch();
    }
    
    if (!calendarStore.availableUsers || calendarStore.availableUsers.length === 0) {
      await calendarStore.fetchAgendaData();
    }
    
    if (!kanbanStore.boards || kanbanStore.boards.length === 0) {
      await kanbanStore.fetchKanbanData();
    }
    
    if (kanbanStore.boards && kanbanStore.boards.length > 0) {
      form.boardId = kanbanStore.activeBoardId || kanbanStore.boards[0].id;
    }

    if (props.ticket) {
      const ticketData = JSON.parse(JSON.stringify(props.ticket));
      if (ticketData.customer && typeof ticketData.customer === 'object') {
        ticketData.customerId = ticketData.customer.id;
      } else if (ticketData.customerId) {
        ticketData.customerId = ticketData.customerId;
      }
      delete ticketData.customer;
      Object.assign(form, ticketData);
      
      if (ticketData.checklist && Array.isArray(ticketData.checklist)) {
        form.checklist = ticketData.checklist.map((item: any) => ({
          title: item.title || item.text || '',
          completed: item.completed ?? item.done ?? false
        }));
      }
      
      if (ticketData.tags && Array.isArray(ticketData.tags)) {
        form.tags = ticketData.tags.map((tag: any) => {
          if (typeof tag === 'object' && tag !== null) {
            return {
              id: tag.id || tag.name,
              name: tag.name || tag.label || '',
              type: tag.type || tag.color || 'info',
              colorClass: tag.colorClass || ''
            };
          }
          return { name: String(tag), type: 'info' };
        });
      }
      
      if (ticketData.assignees && Array.isArray(ticketData.assignees)) {
        form.assignees = ticketData.assignees.map((a: any) => typeof a === 'object' ? a.id : a);
      }
      if (ticketData.assignee && ticketData.assignee.id && !form.assignees.includes(ticketData.assignee.id)) {
        form.assignees = [ticketData.assignee.id];
      }

      if (!props.ticket.boardId && kanbanStore.boards) {
        let foundBoardId = form.boardId;
        for (const b of kanbanStore.boards) {
          for (const c of b.columns) {
            if (c.cards && c.cards.some((card: any) => String(card.id) === String(props.ticket!.id))) {
              foundBoardId = b.id;
              form.status = c.title;
            }
          }
        }
        form.boardId = foundBoardId;
        
        const colExists = availableColumns.value.some((c: any) => c.title === form.status);
        if (!colExists && form.status) {
          const hasPending = availableColumns.value.some((c: any) => c.title?.toLowerCase().includes('pendente'));
          if (hasPending) {
            form.status = 'Pendente';
          }
        }
      }

      if (!form.checklist) form.checklist = [];
      if (!form.internalNotes) form.internalNotes = [];
      if (!form.attachments) form.attachments = [];
      if (!form.whatsappHistory) form.whatsappHistory = [];
      const hours = parseFloat(form.estimatedHours);
      form.estimatedHours = isNaN(hours) || hours <= 0 ? 2 : hours;
    } else {
      Object.assign(form, {
        id: undefined,
        status: defaultStatus,
        title: '',
        description: '',
        priority: 'medium',
        type: 'support',
        customerId: '',
        assignees: [],
        tags: [],
        checklist: [],
        internalNotes: [],
        attachments: [],
        whatsappHistory: [],
        startDate: '',
        endDate: '',
        estimatedHours: 2
      });
    }
  }
}, { immediate: true });

const getCustomerLabel = (customer: any) => {
  return customer.tradeName || customer.companyName || customer.name;
};

const getCustomerNameById = (id: string) => {
  if (!id) return '';
  const customer = customerStore.items?.find((c: any) => String(c.id) === String(id));
  return customer ? getCustomerLabel(customer) : id;
};

const getStatusColor = (statusId: string) => {
  if (statusId === 'Pendente' || statusId?.includes('Pendente')) return 'bg-amber-500';
  const col = availableColumns.value.find((c: any) => c.title === statusId);
  if (col && col.color) return col.color.split(' ')[0];
  return 'bg-slate-400';
};

const handleClose = () => {
  emit('close');
};

const triggerFileUpload = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) addFiles(target.files);
};

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) addFiles(event.dataTransfer.files);
};

const addFiles = (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    form.attachments.push({ name: files[i].name, size: files[i].size, type: files[i].type });
  }
};

const removeAttachment = (index: number | string) => {
  form.attachments.splice(Number(index), 1);
};

const addInternalNote = () => {
  if (!newNoteMessage.value.trim()) return;
  form.internalNotes.push({
    text: newNoteMessage.value.trim(),
    sender: 'Admin (Você)',
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
  newNoteMessage.value = '';
};

const validateForm = () => {
  let isValid = true;
  if (!form.title || !form.title.trim()) { formErrors.title = true; isValid = false; }
  if (!form.description || form.description === '<p></p>') { formErrors.description = true; isValid = false; }
  if (!form.customerId) { formErrors.customer = true; isValid = false; }
  if (!form.priority) { formErrors.priority = true; isValid = false; }
  if (!form.type) { formErrors.type = true; isValid = false; }

  if (!isValid && (formErrors.title || formErrors.description)) activeTab.value = 'main';
  return isValid;
};

const mapStatusToEnum = (status: string): string => {
  const s = String(status).toLowerCase();
  if (s.includes('pendente') || s === 'open') return 'open';
  if (s.includes('fazer') || s.includes('progress')) return 'in_progress';
  if (s.includes('análise') || s.includes('waiting')) return 'waiting';
  if (s.includes('desenvolvimento') || s.includes('resolved')) return 'resolved';
  if (s.includes('finalizado') || s.includes('closed')) return 'closed';
  return 'open';
};

const submit = () => {
  if (validateForm()) {
    const statusEnum = mapStatusToEnum(form.status);
    
    const formattedTags = (form.tags || []).map((tag: any) => {
      if (typeof tag === 'object' && tag !== null) {
        return { name: tag.name || tag.label || String(tag), color: tag.color || tag.colorClass?.split(' ')[0]?.replace('bg-', '') || 'info' };
      }
      return { name: String(tag), color: 'info' };
    });
    
    const formattedChecklist = (form.checklist || []).map((item: any) => {
      if (typeof item === 'object') {
        return { title: String(item.title || item.text || '').slice(0, 200), completed: item.completed || false };
      }
      return { title: String(item).slice(0, 200), completed: false };
    });
    
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      ...(props.isKanban ? { cardId: form.id } : {}),
      title: form.title,
      description: form.description || '',
      status: statusEnum,
      priority: form.priority || 'medium',
      type: form.type || 'support',
      customerId: form.customerId,
      assignees: form.assignees || [],
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      estimatedHours: typeof form.estimatedHours === 'number' ? form.estimatedHours : 2,
      tags: formattedTags,
      checklist: formattedChecklist,
      boardId: form.boardId || null
    };
    
    console.log('[submit] checklist formattedChecklist:', formattedChecklist);
    console.log('[submit] full payload:', JSON.stringify(payload));
    
    emit('save', payload);
  } else {
    ElMessage.warning('Preencha todos os campos obrigatórios marcados em vermelho.');
  }
};

const handleApprove = () => {
  if (validateForm()) {
    const targetCol = kanbanStore.columns?.find((c: any) => c.title.toLowerCase().includes('fazer'));
    form.status = targetCol?.title || 'A Fazer';
    
    submit();
  } else {
    ElMessage.warning('Revise os detalhes pendentes do Ticket antes de aprovar.');
  }
};

const handleApproveKanban = () => {
  if (validateForm()) {
    const targetCol = kanbanStore.columns?.find((c: any) => c.title.toLowerCase().includes('fazer'));
    const newStatus = targetCol?.title || 'A Fazer';
    const payload = {
      ...form,
      status: newStatus
    };
    if (!payload.boardId) delete payload.boardId;
    if (!payload.startDate || payload.startDate === '') delete payload.startDate;
    if (!payload.endDate || payload.endDate === '') delete payload.endDate;
    emit('approve-kanban', payload);
  } else {
    ElMessage.warning('Revise os detalhes pendentes do Ticket antes de enviar para o Kanban.');
  }
};
</script>

<style scoped>
:deep(.enterprise-ticket-dialog .el-dialog__header) {
  display: none !important;
}

:deep(.enterprise-ticket-dialog .el-dialog__body) {
  padding: 0 !important;
}

:deep(.enterprise-tabs .el-tabs__item) {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  height: 48px;
}

:deep(.enterprise-tabs .el-tabs__item.is-active) {
  color: #3b82f6;
}

:deep(.enterprise-tabs .el-tabs__active-bar) {
  background-color: #3b82f6;
  height: 3px;
  border-radius: 3px 3px 0 0;
}

:deep(.enterprise-input .el-input__wrapper),
:deep(.enterprise-select .el-select__wrapper) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background-color: #ffffff !important;
  transition: all 0.2s;
}

:deep(.enterprise-input .el-input__wrapper.is-focus),
:deep(.enterprise-select .el-select__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>