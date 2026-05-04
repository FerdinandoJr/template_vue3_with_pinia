<template>
  <div class="p-6 h-full flex flex-col bg-[#f8fafd] overflow-hidden">

    <div class="mb-4 flex flex-col md:flex-row justify-between md:items-center shrink-0 gap-4 flex-shrink-0">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Tickets de Suporte</h2>
        <p class="text-slate-500 text-sm font-medium mt-1">Gerencie e priorize o atendimento aos clientes</p>
      </div>
      <div class="flex items-center gap-4">
        <el-button type="primary" size="large" class="!font-bold !rounded-lg shadow-sm" @click="openModal()">
          <el-icon class="mr-2">
            <Plus />
          </el-icon>
          Novo Ticket
        </el-button>
      </div>
    </div>

    <div class="flex-shrink-0">
      <TicketStats :total="store.total" :open="openTickets" :in-progress="inProgressTickets"
        :resolved="resolvedTickets" />
    </div>

    <div class="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
      <TicketFilters :filters="currentFilters" @update:filters="handleFilter" class="mb-6" />

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <TicketTable :tickets="store.items" :total="store.total" :current-page="store.currentPage"
          :page-size="store.pageSize" @view="openModal" @edit="openModal" @update:current-page="store.setPage"
          @update:page-size="store.setPageSize" />
      </div>
    </div>

    <TicketModal :is-open="isModalOpen" :ticket="selectedTicket" :initial-data="selectedTicket || {}"
      @close="closeModal" @save="saveTicket" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TicketStats from '../components/TicketStats.vue';
import TicketFilters from '../components/TicketFilters.vue';
import TicketTable from '../components/TicketTable.vue';
import TicketModal from '../components/TicketModal.vue';

import { useTicketsStore } from '../store/tickets.store';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';
import { kanbanServices } from '@/modules/kanban/data/kanban.services';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import type { ITicket } from '../../domain/entities/Ticket';

const store = useTicketsStore() as any;
const kanbanStore = useKanbanStore() as any;
const customerStore = useCustomerStore() as any;

const isModalOpen = ref(false);
const selectedTicket = ref<ITicket | null>(null);

const currentFilters = ref<any>({
  query: '',
  status: 'all',
  customers: [],
  dateRange: null,
  assignees: [],
  ownerOnly: true
});

const openTickets = computed(() => store.items.filter((t: any) => t.status === 'open' || t.status === 'pending_approval').length);
const inProgressTickets = computed(() => store.items.filter((t: any) => t.status === 'in_progress').length);
const resolvedTickets = computed(() => store.items.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length);

const handleFilter = (filters: any) => {
  store.applyFilters(filters);
};

const openModal = (ticket?: ITicket) => {
  selectedTicket.value = ticket ? { ...ticket } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedTicket.value = null;
};

const saveTicket = async (ticketData: any) => {
  const kanbanStore = useKanbanStore();

  try {
    const ticketId = ticketData.id;
    let savedTicket: any = null;

    if (ticketId && typeof ticketId === 'string' && ticketId.length > 0) {
      savedTicket = await store.updateTicket(ticketId, ticketData);
      ElMessage.success('Ticket atualizado!');
    } else {
      savedTicket = await store.createTicket({ ...ticketData, createdAt: new Date() });
      ElMessage.success('Novo ticket criado!');
    }

    await kanbanStore.fetchKanbanData();
  } catch (error) {
    console.error('[saveTicket] error:', error);
    ElMessage.error('Erro ao salvar.');
  } finally {
    closeModal();
  }
};



onMounted(() => {
  customerStore.fetch?.();
  store.fetch?.();
  if (!kanbanStore.boards || kanbanStore.boards.length === 0) {
    kanbanStore.fetchKanbanData?.();
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

:deep(.el-table) {
  width: 100% !important;
}
</style>