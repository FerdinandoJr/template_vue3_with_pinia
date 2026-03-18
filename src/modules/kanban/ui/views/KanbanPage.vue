<template>
  <div class="h-[calc(100vh-4rem)] p-6 bg-[#f8fafd] flex flex-col overflow-hidden">

    <div class="mb-6 flex justify-between items-center shrink-0">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Kanban Board</h2>
        <p class="text-slate-500 text-sm font-medium mt-1">Crie listas, renomeie e organize a ordem dos cards livremente
        </p>
      </div>
      <el-button type="primary" size="large" class="!font-bold !rounded-lg shadow-sm" @click="openNewTicketModal">
        <el-icon class="mr-2">
          <Plus />
        </el-icon> Novo Ticket
      </el-button>
    </div>

    <div class="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scroll-x items-start">

      <KanbanColumn v-for="col in kanbanStore.columns" :key="col.id" :column-id="col.id" v-model:title="col.title"
        :color="col.color" :cards="getTicketsByColumn(col.id)" @remove="handleRemoveColumn"
        @open-ticket="openTicketDetails" />

      <button @click="kanbanStore.addColumn()"
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
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

import { useKanbanStore } from '../store/kanban.store';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store'; // <-- IMPORTADO O STORE DE CLIENTES
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';

import KanbanColumn from '../components/KanbanColumn.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';

const kanbanStore = useKanbanStore();
const ticketsStore = useTicketsStore();
const customerStore = useCustomerStore(); // <-- INICIALIZADO

const isModalOpen = ref(false);
const selectedTicket = ref<ITicket | null>(null);

onMounted(async () => {
  await kanbanStore.fetchKanbanData();

  // <-- MÁGICA: Puxa a lista de Clientes ao abrir o Kanban
  if (customerStore.items.length === 0) {
    await customerStore.fetch();
  }
});

const getTicketsByColumn = (columnId: string) => {
  if (!ticketsStore.items) return [];
  return ticketsStore.items.filter(t => (t.status as unknown as string) === columnId);
};

const handleRemoveColumn = (id: string) => {
  ElMessageBox.confirm(
    'Tem a certeza que deseja excluir esta coluna? Os tickets nela não serão apagados, mas ficarão ocultos até receberem novo status.',
    'Atenção',
    { confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', type: 'warning' }
  ).then(() => {
    kanbanStore.removeColumn(id);
  }).catch(() => { });
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

  await kanbanStore.fetchKanbanData();
};
</script>

<style scoped>
.custom-scroll-x {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.custom-scroll-x::-webkit-scrollbar {
  height: 8px;
}

.custom-scroll-x::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll-x::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>