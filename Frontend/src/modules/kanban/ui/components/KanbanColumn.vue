<template>
  <div
    class="w-[270px] min-w-[270px] h-[670px] shrink-0 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
    <div class="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between z-10">
      <div class="flex items-center gap-3 w-full">
        <el-popover trigger="click" :width="200">
          <template #reference>
            <div class="w-3 h-3 rounded-full shadow-sm cursor-pointer hover:scale-110 transition-transform" :style="{ backgroundColor: color }"></div>
          </template>
          <div class="flex flex-wrap gap-2 p-2">
            <div v-for="c in colors" :key="c" class="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 border-transparent hover:border-white shadow-sm"
              :style="{ backgroundColor: c }" @click="setColor(c)"></div>
          </div>
        </el-popover>
        <input v-model="localTitle" @blur="updateTitle" @keyup.enter="updateTitle"
          class="font-black text-[15px] text-slate-700 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 w-full truncate transition-all" />
        <div class="flex items-center gap-2 shrink-0">
          <el-popover trigger="click" :width="160">
            <template #reference>
              <span class="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full" :class="{ '!text-orange-600 !bg-orange-50': isWipExceeded, '!text-blue-600 !bg-blue-50': isWipNearLimit && !isWipExceeded }">
                <template v-if="wipLimit">{{ cards.length }}/{{ wipLimit }}</template>
                <template v-else>{{ cards.length }}</template>
              </span>
            </template>
            <div class="p-2">
              <p class="text-xs font-bold text-slate-600 mb-2">Limite WIP (Work In Progress)</p>
              <el-input-number v-model="localWipLimit" :min="0" :max="20" size="small" class="!w-full" />
              <el-button size="small" type="primary" class="!w-full mt-2" @click="saveWipLimit">Salvar</el-button>
            </div>
          </el-popover>
          <button @click="$emit('remove', columnId)"
            class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <el-icon>
              <Close />
            </el-icon>
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar" :class="{ 'opacity-50': !canMove }" @dragover.prevent @drop="canMove ? onDropColumn($event) : null">
      <KanbanCard 
        v-for="card in cards" 
        :key="card.id" 
        :ticket="card" 
        :draggable="canMove"
        @dragstart="onDragStart($event, card)" 
        @drop.stop="onDropCard($event, card)"
        @click="$emit('open-ticket', card)" 
      />

      <div v-if="cards.length === 0"
        class="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold pointer-events-none">
        Arraste tickets para cá
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Variável global para compartilhar o timer entre todas as instâncias de KanbanColumn.
// Isso resolve o problema de duplicação impedindo que as colunas rodem a mesma função em paralelo.
let scheduleDebounceTimer: any = null;
</script>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { Close } from '@element-plus/icons-vue';
import KanbanCard from './KanbanCard.vue';
import { useKanbanStore } from '../store/kanban.store';
import { useCalendarStore } from '@/modules/calendar/ui/store/calendar.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { kanbanServices } from '../../data/kanban.services';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import { ticketServices } from '@/modules/tickets/data/ticket.services';

let titleUpdateDebounce: any = null;

const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b', '#94a3b8'];

const props = defineProps<{
  columnId: string;
  title: string;
  color: string;
  cards: any[];
  wipLimit?: number;
}>();

const emit = defineEmits(['update:title', 'remove', 'open-ticket', 'update:wipLimit']);

const kanbanStore = useKanbanStore() as any;
const calendarStore = useCalendarStore() as any;
const authStore = useAuthStore() as any;

const localWipLimit = ref(props.wipLimit || 0);

const isWipExceeded = computed(() => props.wipLimit && props.cards.length >= props.wipLimit);
const isWipNearLimit = computed(() => props.wipLimit && props.cards.length >= props.wipLimit * 0.8);

const saveWipLimit = () => {
  emit('update:wipLimit', localWipLimit.value);
  kanbanStore.updateColumn(props.columnId, { wipLimit: localWipLimit.value });
};

const canMove = computed(() => {
  const isApproved = props.title?.toLowerCase().includes('fazer') || 
                   props.title?.toLowerCase().includes('análise') || 
                   props.title?.toLowerCase().includes('desenvolvimento') ||
                   props.title?.toLowerCase().includes('finalizado');
  return authStore.hasRole(['Desenvolvedor', 'Gerente', 'Administrador']) || isApproved;
});

const localTitle = ref(props.title);

watch(() => props.title, (newVal) => {
  localTitle.value = newVal;
});

const updateTitle = () => {
  clearTimeout(titleUpdateDebounce);
  titleUpdateDebounce = setTimeout(() => {
    kanbanStore.updateColumn(props.columnId, { title: localTitle.value });
  }, 500);
};

let colorUpdateDebounce: any = null;

const setColor = (newColor: string) => {
  clearTimeout(colorUpdateDebounce);
  colorUpdateDebounce = setTimeout(() => {
    kanbanStore.updateColumn(props.columnId, { color: newColor });
  }, 300);
};

const onDragStart = (event: DragEvent, ticket: any) => {
  event.stopPropagation();
  const idToSend = ticket.ticketId || ticket.id;
  if (event.dataTransfer) {
    event.dataTransfer.setData('ticketId', String(idToSend));
    event.dataTransfer.setData('type', 'card');
    event.dataTransfer.effectAllowed = 'move';
  }
};

const findCardInKanban = (id: string) => {
  for (const col of kanbanStore.columns) {
    const index = col.cards.findIndex((c: any) => String(c.ticketId || c.id) === String(id));
    if (index !== -1) return { col, index, card: col.cards[index] };
  }
  return null;
};

const syncTicketBackend = async (ticketId: string, newColumnId: string) => {
  if (!ticketId) return;
  
  try {
    const targetColumn = kanbanStore.columns.find((c: any) => c.id === newColumnId);
    let newStatus = targetColumn?.ticketStatus || 'open';
    
    // Normalização local para garantir consistência imediata
    const title = (targetColumn?.title || '').toLowerCase();
    if (title.includes('resolvido') || title.includes('resolved') || title.includes('finalizado')) {
      newStatus = 'resolved';
    } else if (title.includes('closed') || title.includes('concluído') || title.includes('concluido')) {
      newStatus = 'closed';
    } else if (title.includes('fazer') || title.includes('progress') || title.includes('desenvolvimento') || title.includes('andamento')) {
      newStatus = 'in_progress';
    } else if (title.includes('análise') || title.includes('analise') || title.includes('waiting')) {
      newStatus = 'waiting';
    }

    await ticketServices.update(ticketId, { status: newStatus });
    console.log('[KanbanColumn] Ticket atualizado para status:', newStatus);
    
    // Atualiza o store de tickets em tempo real (compartilhado via Pinia)
    try {
      const ticketsStore = useTicketsStore();
      await ticketsStore.fetch();
      console.log('[KanbanColumn] TicketsStore atualizado em tempo real');
    } catch (e) {
      console.error('[KanbanColumn] Erro ao atualizar TicketsStore:', e);
    }
    
  } catch (error: any) {
    if (error?.status === 404 || error?.message?.includes('não encontrado')) {
      console.warn('[KanbanColumn] Ticket não encontrado, limpando referência órfã no card');
      const card = kanbanStore.columns
        ?.flatMap((col: any) => col.cards)
        ?.find((c: any) => c.ticketId === ticketId);
      
      if (card) {
        try {
          await kanbanStore.updateCard(card.id, { ticketId: null });
        } catch (e) {
          console.error('[KanbanColumn] Erro ao limpar referência órfã:', e);
        }
      }
    } else {
      console.error('[KanbanColumn] Erro ao sincronizar ticket:', error);
    }
  }
};

const smartScheduleQueue = (userId: string) => {
  // Cancela qualquer agendamento em andamento para rodar apenas UMA VEZ
  clearTimeout(scheduleDebounceTimer);

  scheduleDebounceTimer = setTimeout(() => {
    try {
      const now = new Date();

      // Limpa os eventos gerados automaticamente na agenda ANTES de inserir os novos
      const cleanEvents = calendarStore.allEvents
        ? calendarStore.allEvents.filter((e: any) => !(e.isKanbanAuto && String(e.userId) === String(userId)))
        : [];

      const pendingCards: any[] = [];

      kanbanStore.columns?.forEach((col: any) => {
        const userCards = col.cards.filter((c: any) =>
          String(c.assignedTo) === String(userId) ||
          String(c.userId) === String(userId) ||
          String(c.ownerId) === String(userId) ||
          (c.assignees && Array.isArray(c.assignees) && c.assignees.includes(userId))
        );
        pendingCards.push(...userCards);
      });

      let currentSlot = new Date(now);
      const minutes = currentSlot.getMinutes();
      const remainder = 15 - (minutes % 15);
      currentSlot.setMinutes(minutes + remainder, 0, 0);

      const pad = (n: number) => String(n).padStart(2, '0');
      const novosEventos: any[] = [];

      pendingCards.forEach(card => {
        let remainingHours = Number(card.estimatedHours) || Number(card.estimate) || 2;

        while (remainingHours > 0) {
          if (currentSlot.getHours() < 9) currentSlot.setHours(9, 0, 0, 0);
          if (currentSlot.getHours() >= 18) {
            currentSlot.setDate(currentSlot.getDate() + 1);
            currentSlot.setHours(9, 0, 0, 0);
          }
          if (currentSlot.getDay() === 0) currentSlot.setDate(currentSlot.getDate() + 1);
          if (currentSlot.getDay() === 6) currentSlot.setDate(currentSlot.getDate() + 2);
          if (currentSlot.getHours() >= 12 && currentSlot.getHours() < 13) currentSlot.setHours(13, 0, 0, 0);

          let nextBoundary = new Date(currentSlot);
          if (currentSlot.getHours() < 12) nextBoundary.setHours(12, 0, 0, 0);
          else nextBoundary.setHours(18, 0, 0, 0);

          const availableHours = (nextBoundary.getTime() - currentSlot.getTime()) / (1000 * 60 * 60);
          const hoursToAllocate = Math.min(remainingHours, availableHours);

          if (hoursToAllocate > 0) {
            const endTime = new Date(currentSlot.getTime() + hoursToAllocate * 60 * 60 * 1000);
            const isInProgress = ['in-progress', 'in_progress', 'doing'].includes(String(card.status).toLowerCase());

            const dateStr = `${currentSlot.getFullYear()}-${pad(currentSlot.getMonth() + 1)}-${pad(currentSlot.getDate())}`;
            const timeStr = `${pad(currentSlot.getHours())}:${pad(currentSlot.getMinutes())}`;
            const endTimeStr = `${pad(endTime.getHours())}:${pad(endTime.getMinutes())}`;

            const newEvent = {
              id: `kanban-${card.id}-${currentSlot.getTime()}`,
              title: `${isInProgress ? '⚡' : '📅'} ${card.title || '#' + card.id}`,
              date: dateStr,
              time: timeStr,
              endTime: endTimeStr,
              start: new Date(`${dateStr}T${timeStr}:00`),
              end: new Date(`${dateStr}T${endTimeStr}:00`),
              userId: String(userId),
              isKanbanAuto: true,
              cardId: card.id,
              client: card.customerName || card.customer || 'Cliente não informado',
              colorHex: isInProgress ? '#3b82f6' : '#94a3b8',
              backgroundColor: isInProgress ? '#3b82f6' : '#f1f5f9',
              textColor: isInProgress ? '#ffffff' : '#475569',
              borderColor: isInProgress ? '#2563eb' : '#cbd5e1',
            };
            novosEventos.push(newEvent);

            remainingHours -= hoursToAllocate;
            currentSlot = new Date(endTime);
          } else {
            currentSlot.setHours(currentSlot.getHours() + 1);
          }
        }
      });

      // Substitui os eventos no calendário em uma única operação para evitar duplicações
      calendarStore.allEvents = [...cleanEvents, ...novosEventos];
    } catch (error) {
      console.error("Falha no Smart Schedule:", error);
    }
  }, 300); // 300ms de margem de segurança para o processamento em lote
};

// Observador para reagir instantaneamente quando um Card for salvo/modificado 
watch(() => kanbanStore.columns, () => {
  const userId = authStore.user?.id || '1';
  smartScheduleQueue(String(userId));
}, { deep: true });

onMounted(() => {
  const userId = authStore.user?.id || '1';
  smartScheduleQueue(String(userId));
});

const onDropColumn = async (event: DragEvent) => {
  const ticketId = event.dataTransfer?.getData('ticketId');
  if (!ticketId) return;

  const found = findCardInKanban(ticketId);
  if (!found) return;

  const { col: sourceCol, index: draggedIndex, card: draggedCard } = found;

  if (sourceCol.id === props.columnId) return;

  sourceCol.cards.splice(draggedIndex, 1);
  const targetCol = kanbanStore.columns.find((c: any) => c.id === props.columnId);

  if (targetCol) {
    draggedCard.status = targetCol.title;
    draggedCard.columnId = targetCol.id;
    draggedCard.order = targetCol.cards.length;
    targetCol.cards.push(draggedCard);

    try {
      await kanbanServices.moveCard(draggedCard.id, targetCol.id, targetCol.cards.length - 1);
      console.log('[KanbanColumn] Card movido com sucesso para:', targetCol.title);
      
      // Sincroniza o ticket associado se houver
      if (draggedCard.ticketId) {
        await syncTicketBackend(draggedCard.ticketId, props.columnId);
      }
    } catch (error) {
      console.error('[KanbanColumn] Erro ao mover card:', error);
      sourceCol.cards.splice(draggedIndex, 0, draggedCard);
      targetCol.cards.pop();
    }

    if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();

    const userId = authStore.user?.id || draggedCard.assignedTo || draggedCard.userId || '1';
    smartScheduleQueue(String(userId));
  }
};

const onDropCard = async (event: DragEvent, targetTicket: any) => {
  const ticketId = event.dataTransfer?.getData('ticketId');
  if (!ticketId) return;

  const found = findCardInKanban(ticketId);
  if (!found) return;

  const { col: sourceCol, index: draggedIndex, card: draggedCard } = found;

  const targetElement = event.currentTarget as HTMLElement;
  const bounding = targetElement.getBoundingClientRect();
  const offset = event.clientY - bounding.top;
  const isUpperHalf = offset < bounding.height / 2;

  sourceCol.cards.splice(draggedIndex, 1);
  const targetCol = kanbanStore.columns.find((c: any) => c.id === props.columnId);
  if (!targetCol) return;

  let targetIndex = targetCol.cards.findIndex((t: any) => String(t.id) === String(targetTicket.id));
  if (!isUpperHalf) targetIndex++;

  draggedCard.status = targetCol.title;
  draggedCard.columnId = targetCol.id;
  draggedCard.order = targetIndex;
  targetCol.cards.splice(targetIndex, 0, draggedCard);

  try {
    await kanbanServices.moveCard(draggedCard.id, targetCol.id, targetIndex);
    await kanbanServices.reorderCardsInColumn(
      targetCol.id, 
      targetCol.cards.map((c: any) => c.id)
    );
    console.log('[KanbanColumn] Card movido para posição específica com sucesso');

    // Sincroniza o ticket associado se houver
    if (draggedCard.ticketId) {
      await syncTicketBackend(draggedCard.ticketId, props.columnId);
    }
  } catch (error) {
    console.error('[KanbanColumn] Erro ao mover card:', error);
  }

  if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();

  const userId = authStore.user?.id || draggedCard.assignedTo || draggedCard.userId || '1';
  smartScheduleQueue(String(userId));
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>