<template>
  <div class="h-[calc(100vh-4rem)] p-6 bg-[#f8fafd] flex flex-col overflow-hidden">
    <div class="mb-6 flex justify-between items-center shrink-0">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Kanban Board</h2>
        <p class="text-slate-500 text-sm font-medium mt-1">Crie colunas, renomeie e arraste os cards conforme a sua
          necessidade</p>
      </div>
      <el-button type="primary" size="large" class="!font-bold !rounded-lg shadow-sm" @click="openNewTicketModal">
        <el-icon class="mr-2">
          <Plus />
        </el-icon> Novo Ticket
      </el-button>
    </div>

    <div class="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-start">

      <div v-for="col in columns" :key="col.id"
        class="flex flex-col w-[340px] shrink-0 bg-slate-100/50 rounded-2xl p-4 border border-slate-200"
        @dragover.prevent @drop.stop="onDropColumn($event, col.id)">
        <div class="flex items-center justify-between mb-4 px-1 group">

          <div class="flex items-center gap-2 flex-1">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="col.color"></span>
            <input v-model="col.title"
              class="bg-transparent border-none focus:bg-white focus:ring-2 focus:ring-blue-400 rounded px-2 py-1 w-full text-xs font-black text-slate-700 uppercase tracking-widest outline-none transition-all"
              placeholder="Nome da Coluna" />
          </div>

          <div class="flex items-center gap-2 shrink-0 ml-2">
            <span class="bg-white text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
              {{ getTicketsByColumn(col.id).length }}
            </span>

            <button @click="removeColumn(col.id)"
              class="bg-red-50 hover:bg-red-100 text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center"
              title="Excluir coluna">
              <el-icon :size="14">
                <Close />
              </el-icon>
            </button>
          </div>

        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-[150px]">

          <div v-for="ticket in getTicketsByColumn(col.id)" :key="ticket.id" draggable="true"
            @dragstart="onDragStart($event, ticket)" @dragover.prevent @drop.stop="onDropCard($event, ticket, col.id)"
            @click="openTicketDetails(ticket)" class="cursor-grab active:cursor-grabbing transition-transform">
            <KanbanCard :ticket="ticket" class="pointer-events-none" />
          </div>

        </div>
      </div>

      <button @click="addColumn"
        class="w-[340px] shrink-0 flex items-center justify-center gap-2 py-4 bg-transparent rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all font-bold cursor-pointer">
        <el-icon>
          <Plus />
        </el-icon> Adicionar Lista
      </button>

    </div>

    <TicketModal v-if="isModalOpen" :is-open="isModalOpen" :ticket="selectedTicket" @close="isModalOpen = false"
      @save="onTicketSaved" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Close } from '@element-plus/icons-vue';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';
import { TicketStatus } from '@/modules/tickets/domain/valueObjects/ticket-status.enum';

import KanbanCard from '../components/KanbanCard.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';

const ticketsStore = useTicketsStore();
const isModalOpen = ref(false);
const selectedTicket = ref<ITicket | null>(null);

const colors = ['bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];

const columns = ref<{ id: string; title: string; color: string }[]>([
  { id: 'open', title: 'Abertos', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'Em Andamento', color: 'bg-amber-500' },
  { id: 'resolved', title: 'Resolvidos', color: 'bg-green-500' }
]);

onMounted(() => {
  ticketsStore.fetch();
});

const getTicketsByColumn = (columnId: string) => {
  return ticketsStore.items.filter(t => (t.status as unknown as string) === columnId);
};

const addColumn = () => {
  const newId = 'col_' + Date.now();
  const randomColor: string = colors[Math.floor(Math.random() * colors.length)] || 'bg-blue-500';
  columns.value.push({ id: newId, title: 'Nova Lista', color: randomColor });
};

const removeColumn = (id: string) => {
  if (confirm('Tem a certeza que deseja excluir esta coluna? Os tickets nela não serão apagados, mas ficarão sem lista.')) {
    columns.value = columns.value.filter(col => col.id !== id);
  }
};

const onDragStart = (event: DragEvent, ticket: ITicket) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('ticketId', String(ticket.id));
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onDropColumn = async (event: DragEvent, newColumnId: string) => {
  const ticketId = event.dataTransfer?.getData('ticketId');
  if (!ticketId) return;

  const ticket = ticketsStore.items.find(t => String(t.id) === ticketId);

  if (ticket && (ticket.status as unknown as string) !== newColumnId) {
    const previousStatus = ticket.status;
    ticket.status = newColumnId as unknown as TicketStatus;

    try {
      await ticketsStore.updateTicket(ticket.id, { status: newColumnId as unknown as TicketStatus });
    } catch (error) {
      ticket.status = previousStatus;
    }
  }
};

const onDropCard = async (event: DragEvent, targetTicket: ITicket, newColumnId: string) => {
  const ticketId = event.dataTransfer?.getData('ticketId');
  if (!ticketId) return;

  const draggedIndex = ticketsStore.items.findIndex(t => String(t.id) === ticketId);
  if (draggedIndex === -1) return;

  const draggedTicket = ticketsStore.items[draggedIndex];

  if (!draggedTicket) return;

  const previousStatus = draggedTicket.status;

  const targetElement = event.currentTarget as HTMLElement;
  const bounding = targetElement.getBoundingClientRect();
  const offset = event.clientY - bounding.top;
  const isUpperHalf = offset < bounding.height / 2;

  ticketsStore.items.splice(draggedIndex, 1);

  let targetIndex = ticketsStore.items.findIndex(t => t.id === targetTicket.id);

  if (!isUpperHalf) {
    targetIndex++;
  }

  ticketsStore.items.splice(targetIndex, 0, draggedTicket);

  if ((previousStatus as unknown as string) !== newColumnId) {
    draggedTicket.status = newColumnId as unknown as TicketStatus;
    try {
      await ticketsStore.updateTicket(draggedTicket.id, { status: newColumnId as unknown as TicketStatus });
    } catch (error) {
      draggedTicket.status = previousStatus;
    }
  }
};

const openNewTicketModal = () => {
  selectedTicket.value = null;
  isModalOpen.value = true;
};

const openTicketDetails = (ticket: ITicket) => {
  selectedTicket.value = ticket;
  isModalOpen.value = true;
};

const onTicketSaved = async (ticketData: any) => {
  isModalOpen.value = false;

  if (ticketData.id) {
    await ticketsStore.updateTicket(ticketData.id, ticketData);
  } else {
    if (typeof (ticketsStore as any).createTicket === 'function') {
      await (ticketsStore as any).createTicket(ticketData);
    } else if (typeof (ticketsStore as any).create === 'function') {
      await (ticketsStore as any).create(ticketData);
    } else if (typeof (ticketsStore as any).addTicket === 'function') {
      await (ticketsStore as any).addTicket(ticketData);
    }
  }

  await ticketsStore.fetch();
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>