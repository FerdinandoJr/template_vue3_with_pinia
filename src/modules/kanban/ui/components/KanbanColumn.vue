<template>
  <div class="flex flex-col w-[340px] shrink-0 bg-slate-100/50 rounded-2xl p-4 border border-slate-200 shadow-sm h-full"
    @dragover.prevent @drop.stop="onDropColumn($event)">

    <div class="flex items-center justify-between mb-4 px-1 group sticky top-0">
      <div class="flex items-center gap-2 flex-1">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="color"></span>
        <input v-model="localTitle" @change="updateTitle"
          class="bg-transparent border-none focus:bg-white focus:ring-2 focus:ring-blue-400 rounded px-2 py-1 w-full text-xs font-black text-slate-700 uppercase tracking-widest outline-none transition-all"
          placeholder="Nome da Lista" />
      </div>

      <div class="flex items-center gap-2 shrink-0 ml-2">
        <span
          class="bg-white text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border border-slate-200">
          {{ cards.length }}
        </span>
        <button @click="$emit('remove', columnId)"
          class="bg-red-50 hover:bg-red-100 text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center border border-red-100"
          title="Excluir lista">
          <el-icon :size="14">
            <Close />
          </el-icon>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-[150px] pb-6">
      <div v-for="ticket in cards" :key="ticket.id" draggable="true" @dragstart="onDragStart($event, ticket)"
        @dragover.prevent @drop.stop="onDropCard($event, ticket)" @click="$emit('open-ticket', ticket)"
        class="cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-0.5">

        <KanbanCard :ticket="ticket" class="pointer-events-none shadow-sm hover:shadow-md transition-shadow" />
      </div>

      <div v-if="cards.length === 0"
        class="h-28 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest pointer-events-none bg-slate-50/50">
        Solte Aqui
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import KanbanCard from './KanbanCard.vue';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import { useKanbanStore } from '../store/kanban.store';

const props = defineProps<{
  columnId: string;
  title: string;
  color: string;
  cards: any[];
}>();

const emit = defineEmits(['update:title', 'remove', 'open-ticket']);

const ticketsStore = useTicketsStore() as any;
const kanbanStore = useKanbanStore() as any;

const localTitle = ref(props.title);
watch(() => props.title, (newVal) => { localTitle.value = newVal; });
const updateTitle = () => { emit('update:title', localTitle.value); };

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
  const isTicket = ticketsStore.items?.find((t: any) => String(t.id) === String(id));
  if (!isTicket) return;

  try {
    if (typeof ticketsStore.updateTicket === 'function') {
      await ticketsStore.updateTicket(id, { status: newStatus });
    } else if (typeof ticketsStore.update === 'function') {
      await ticketsStore.update(id, { status: newStatus });
    }
  } catch (e: any) {
  }
};

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
  }
};

const onDropCard = async (event: DragEvent, targetTicket: any) => {
  const ticketId = event.dataTransfer?.getData('ticketId');
  if (!ticketId) return;

  const found = findCardInKanban(ticketId);
  if (!found) return;

  const { col: sourceCol, index: draggedIndex, card: draggedCard } = found;
  const previousStatus = draggedCard.status;

  const targetElement = event.currentTarget as HTMLElement;
  const bounding = targetElement.getBoundingClientRect();
  const offset = event.clientY - bounding.top;
  const isUpperHalf = offset < bounding.height / 2;

  sourceCol.cards.splice(draggedIndex, 1);

  const targetCol = kanbanStore.columns.find((c: any) => c.id === props.columnId);
  if (!targetCol) return;

  let targetIndex = targetCol.cards.findIndex((t: any) => String(t.id) === String(targetTicket.id));

  if (!isUpperHalf) {
    targetIndex++;
  }

  draggedCard.status = props.columnId;
  targetCol.cards.splice(targetIndex, 0, draggedCard);

  if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();

  if (String(previousStatus) !== String(props.columnId)) {
    syncTicketBackend(draggedCard.id, props.columnId);
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>