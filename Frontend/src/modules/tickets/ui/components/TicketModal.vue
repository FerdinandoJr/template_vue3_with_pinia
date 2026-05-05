<template>
  <el-dialog :model-value="isOpen" @update:model-value="!$event && handleClose()" width="95%" style="max-width: 1050px;"
    align-center destroy-on-close :show-close="false" :close-on-click-modal="false" class="enterprise-ticket-dialog"
    append-to-body>
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
          <TicketModalMainTab v-show="activeTab === 'main'" :form="form" :formErrors="formErrors"
            :is-viewing="props.isViewing" @update-error="handleUpdateError" />

          <TicketModalChatTab v-show="activeTab === 'chat'" :whatsappHistory="form.whatsappHistory"
            :customerName="getCustomerNameById(form.customerId)" />

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
              <TicketChecklist v-model:items="form.checklist" :readonly="props.isViewing" class="w-full" />
            </div>
          </div>

          <TicketModalNotesTab v-show="activeTab === 'notes'" :internalNotes="form.internalNotes"
            :is-viewing="props.isViewing" @add-note="addInternalNote" />

          <TicketModalAttachmentsTab v-show="activeTab === 'attachments'" :attachments="form.attachments"
            :is-viewing="props.isViewing" @add-files="handleFileSelected" @remove-attachment="removeAttachment" />
        </div>
      </div>

      <div
        class="w-full lg:w-[340px] xl:w-[380px] bg-slate-50 border-l border-slate-200 flex flex-col h-[50vh] lg:h-full shrink-0 relative z-20">
        <TicketModalSidebar :form="form" :formErrors="formErrors" :customers="customerStore.items"
          :boards="kanbanStore.boards" :availableColumns="availableColumns" :teamMembers="teamMembers"
          :canApprove="canApprove" :isKanban="props.isKanban" :is-viewing="props.isViewing"
          :getStatusColor="getStatusColor" :getCustomerLabel="getCustomerLabel"
          @update-error="handleUpdateError" @board-change="onBoardChange"
          @status-change="onStatusChange" />

        <div
          class="p-4 bg-white border-t border-slate-200 flex flex-col gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-30"
          v-if="!props.isViewing">
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
            <el-button @click="handleClose" size="large" class="w-full sm:flex-1 !rounded-xl !h-12 !font-bold"> Cancelar
            </el-button>
            <el-button type="success" size="large" :loading="loading"
              @click="props.isKanban ? handleApproveKanban() : handleApprove()" v-if="canApprove && isPending"
              class="w-full sm:flex-1 !rounded-xl !h-12 !font-black tracking-wide shadow-md">
              <el-icon class="mr-2">
                <Check />
              </el-icon> Aprovar
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
import TicketModalMainTab from './TicketModalMainTab.vue';
import TicketModalChatTab from './TicketModalChatTab.vue';
import TicketModalNotesTab from './TicketModalNotesTab.vue';
import TicketModalAttachmentsTab from './TicketModalAttachmentsTab.vue';
import TicketModalSidebar from './TicketModalSidebar.vue';
import { ticketServices } from '../../data/ticket.services';
const props = defineProps<{
  isOpen: boolean;
  ticket?: ITicket | null | any;
  initialData?: any;
  isViewing?: boolean;
  isKanban?: boolean;
}>();

const emit = defineEmits(['close', 'save', 'switch-edit', 'approve-kanban']);

watch(() => props.ticket, (newTicket) => {
  console.log('[TicketModal] props.ticket mudou:', newTicket);
}, { immediate: true });

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
  kanbanColumnId: null,
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

const handleUpdateError = (field: keyof typeof formErrors, value: boolean) => {
  formErrors[field] = value;
};

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
  const all = kanbanStore.allUsers || [];
  const activeUsers = all.filter((u: any) => u.isActive !== false);
  const authUser = authStore.user;
  if (authUser && !activeUsers.find((u: any) => String(u.id) === String(authUser.id))) {
    activeUsers.push({ ...authUser });
  }
  return activeUsers;
});

const getTeamMemberName = (id: string | number) => {
  const member = teamMembers.value.find((m: any) => String(m.id) === String(id));
  return member ? member.name : String(id);
};

const availableColumns = computed(() => {
  if (!kanbanStore.boards || kanbanStore.boards.length === 0) {
    return kanbanStore.columns || [];
  }
  const board = kanbanStore.boards.find((b: any) => String(b.id) === String(form.boardId));
  const cols = board ? board.columns : getAllColumns();
  return cols.length > 0 ? cols : getAllColumns();
});

const getAllColumns = () => {
  const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns || []) || [];
  return allCols.length > 0 ? allCols : (kanbanStore.columns || []);
};

const isPending = computed(() => {
  if (props.isKanban) {
    const colId = props.ticket?.columnId || form.columnId;
    const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns) || kanbanStore.columns || [];
    const col = allCols.find((c: any) => c.id === colId);
    if (col && col.title.toLowerCase().includes('pendente')) return true;
    if (form.status && String(form.status).toLowerCase().includes('pendente')) return true;
    return false;
  }

  if (props.ticket?.status === 'open' || props.ticket?.status === 'Pendente') return true;
  if (form.status === 'open' || form.status === 'Pendente' || String(form.status).toLowerCase().includes('pendente')) return true;

  return false;
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

  const targetCol = cols.find((c: any) => c.title === newStatus);
  form.kanbanColumnId = targetCol?.id || cols[0]?.id || null;
};

watch(() => props.isOpen, async (isOpen, prevIsOpen) => {
  console.log('[TicketModal] isOpen changed:', isOpen, 'prev:', prevIsOpen);
  console.log('[TicketModal] props.ticket (on isOpen change):', props.ticket);

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

    if (props.ticket) {
      let ticketData: any = null;
      const ticketIdToFetch = props.isKanban ? props.ticket.ticketId : props.ticket.id;

      if (ticketIdToFetch) {
        console.log('[TicketModal] Buscando dados do banco para:', ticketIdToFetch);
        const freshTicket = await ticketServices.getById(ticketIdToFetch);
        if (freshTicket) {
          ticketData = JSON.parse(JSON.stringify(freshTicket));
        }
      }

      if (!ticketData) {
        console.log('[TicketModal] Usando dados locais');
        ticketData = JSON.parse(JSON.stringify(props.ticket));
      }

      if (ticketData.customer && typeof ticketData.customer === 'object') {
        ticketData.customerId = ticketData.customer.id;
        delete ticketData.customer;
      }

      Object.assign(form, ticketData);

      if (ticketData.boardId) {
        form.boardId = ticketData.boardId;
      } else if (props.ticket?.boardId) {
        form.boardId = props.ticket.boardId;
      } else {
        form.boardId = kanbanStore.activeBoardId || '';
      }

      if (props.isKanban && props.ticket?.columnId) {
        form.kanbanColumnId = props.ticket.columnId;
        const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns) || kanbanStore.columns || [];
        const col = allCols.find((c: any) => String(c.id) === String(props.ticket.columnId));
        if (col) {
          form.status = col.title;
          if (col.boardId) form.boardId = col.boardId;
        } else {
          const mapped = mapEnumToStatusTitle(ticketData.status, form.boardId);
          form.status = mapped.title;
          if (mapped.boardId) form.boardId = mapped.boardId;
        }
      } else if (ticketData.kanbanColumnId) {
        form.kanbanColumnId = ticketData.kanbanColumnId;
        const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns) || kanbanStore.columns || [];
        const col = allCols.find((c: any) => String(c.id) === String(ticketData.kanbanColumnId));
        if (col) {
          form.status = col.title;
          if (col.boardId) form.boardId = col.boardId;
        } else {
          const mapped = mapEnumToStatusTitle(ticketData.status, form.boardId);
          form.status = mapped.title;
          if (mapped.boardId) form.boardId = mapped.boardId;
        }
      }

      if (!form.status && ticketData.status) {
        const { title, boardId } = mapEnumToStatusTitle(ticketData.status, ticketData.boardId);
        if (title) form.status = title;
        if (boardId && !form.boardId) form.boardId = boardId;
      }

      if (!form.priority) {
        form.priority = 'medium';
      }

      if (ticketData.checklist && Array.isArray(ticketData.checklist)) {
        form.checklist = ticketData.checklist.map((item: any) => ({
          title: item.title || item.text || '',
          completed: item.completed ?? item.done ?? false
        }));
      } else {
        form.checklist = [];
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
      } else {
        form.tags = [];
      }

      if (ticketData.assignees && Array.isArray(ticketData.assignees)) {
        form.assignees = ticketData.assignees.map((a: any) => typeof a === 'object' ? a.id : a);
      } else if (ticketData.assignee && ticketData.assignee.id) {
        form.assignees = [ticketData.assignee.id];
      } else {
        form.assignees = [];
      }

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
  if (s.includes('fazer')) return 'in_progress';
  if (s.includes('análise') || s.includes('waiting')) return 'waiting';
  if (s.includes('resolvido') || s.includes('resolved')) return 'resolved';
  if (s.includes('finalizado') || s.includes('closed')) return 'closed';
  if (s.includes('progress') || s.includes('desenvolvimento')) return 'in_progress';
  return 'open';
};

const onStatusChange = (statusTitle: string) => {
  const col = availableColumns.value.find((c: any) => c.title === statusTitle);
  if (col) {
    form.kanbanColumnId = col.id;
  }
};

const mapEnumToStatusTitle = (statusEnum: string, boardId?: string): { title: string, boardId?: string } => {
  if (boardId) {
    const board = kanbanStore.boards?.find((b: any) => String(b.id) === String(boardId));
    if (board && board.columns) {
      const col = board.columns.find((c: any) => c.ticketStatus === statusEnum);
      if (col) return { title: col.title, boardId: col.boardId };
    }
  }

  if (kanbanStore.columns) {
    const col = kanbanStore.columns.find((c: any) => c.ticketStatus === statusEnum);
    if (col) return { title: col.title, boardId: col.boardId };
  }

  const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns) || [];
  const col = allCols.find((c: any) => c.ticketStatus === statusEnum);
  if (col) return { title: col.title, boardId: col.boardId };
  const s = String(statusEnum).toLowerCase();
  if (s === 'open' || s.includes('pendente')) return { title: 'Pendente' };
  if (s === 'in_progress') return { title: 'A Fazer' };
  if (s === 'waiting' || s.includes('análise') || s.includes('analise')) return { title: 'Análise' };
  if (s === 'resolved') return { title: 'Resolvido' };
  if (s === 'closed') return { title: 'Finalizado' };
  if (s === 'pending_approval') return { title: 'Aprovação' };
  return { title: statusEnum };
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

    const targetColumn = availableColumns.value.find((c: any) => c.title === form.status);
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      ...(props.isKanban ? { cardId: form.id } : {}),
      title: form.title,
      description: form.description || '',
      status: statusEnum,
      priority: form.priority || 'medium',
      type: form.type || 'support',
      customerId: form.customerId || null,
      assignees: form.assignees || [],
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      estimatedHours: typeof form.estimatedHours === 'number' ? form.estimatedHours : 2,
      tags: formattedTags,
      checklist: formattedChecklist,
      boardId: form.boardId || null,
      kanbanColumnId: targetColumn?.id || form.kanbanColumnId || undefined
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
    const targetCol = availableColumns.value.find((c: any) => c.title.toLowerCase().includes('fazer')) || availableColumns.value[1] || availableColumns.value[0];
    form.status = targetCol?.title || 'A Fazer';

    submit();
  } else {
    ElMessage.warning('Revise os detalhes pendentes do Ticket antes de aprovar.');
  }
};

const handleApproveKanban = () => {
  if (validateForm()) {
    const targetCol = availableColumns.value.find((c: any) => c.title.toLowerCase().includes('fazer')) || availableColumns.value[1] || availableColumns.value[0];
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