<template>
  <div
    class="w-[340px] shrink-0 flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
    <div class="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between z-10">
      <div class="flex items-center gap-3 w-full">
        <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: color }"></div>
        <input v-model="localTitle" @blur="updateTitle" @keyup.enter="updateTitle"
          class="font-black text-[15px] text-slate-700 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 w-full truncate transition-all" />
        <div class="flex items-center gap-2 shrink-0">
          <span class="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{{ cards.length
            }}</span>
          <button @click="$emit('remove', columnId)"
            class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <el-icon>
              <Close />
            </el-icon>
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar" @dragover.prevent @drop="onDropColumn">
      <KanbanCard v-for="card in cards" :key="card.id" :ticket="card" draggable="true"
        @dragstart="onDragStart($event, card)" @drop.stop="onDropCard($event, card)"
        @click="$emit('open-ticket', card)" />

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
import { ref, watch, onMounted } from 'vue';
import { Close } from '@element-plus/icons-vue';
import KanbanCard from './KanbanCard.vue';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import { useKanbanStore } from '../store/kanban.store';
import { useCalendarStore } from '@/modules/calendar/ui/store/calendar.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

const props = defineProps<{
  columnId: string;
  title: string;
  color: string;
  cards: any[];
}>();

const emit = defineEmits(['update:title', 'remove', 'open-ticket']);

const ticketsStore = useTicketsStore() as any;
const kanbanStore = useKanbanStore() as any;
const calendarStore = useCalendarStore() as any;
const authStore = useAuthStore() as any;

const localTitle = ref(props.title);

watch(() => props.title, (newVal) => {
  localTitle.value = newVal;
});

const updateTitle = () => {
  emit('update:title', localTitle.value);
};

const onDragStart = (event: DragEvent, ticket: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('ticketId', String(ticket.id));
    event.dataTransfer.effectAllowed = 'move';
  }
};

const findCardInKanban = (id: string) => {
  for (const col of kanbanStore.columns) {
    const index = col.cards.findIndex((c: any) => String(c.id) === id);
    if (index !== -1) return { col, index, card: col.cards[index] };
  }
  return null;
};

const syncTicketBackend = async (id: string, newStatus: string) => {
  try {
    const ticketExists = ticketsStore.items?.find((t: any) => String(t.id) === String(id));
    if (typeof ticketsStore.updateTicket === 'function') {
      await ticketsStore.updateTicket(id, { status: newStatus });
    } else if (typeof ticketsStore.update === 'function') {
      await ticketsStore.update(id, { status: newStatus });
    }
  } catch (e: any) {
    console.warn("Aviso: Sincronização via API falhou, mas seguindo com a agenda...", e);
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
    draggedCard.status = props.columnId;
    targetCol.cards.push(draggedCard);

    if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();

    syncTicketBackend(draggedCard.id, props.columnId);

    // O watcher lá em cima já vai capturar a queda na coluna, porém chamamos por redundância (o debounce evita rodar 2x)
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

  draggedCard.status = props.columnId;
  targetCol.cards.splice(targetIndex, 0, draggedCard);

  if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();

  syncTicketBackend(draggedCard.id, props.columnId);

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