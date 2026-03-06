<template>
  <div class="h-[calc(100vh-4rem)] bg-[#f8fafc] p-6 flex flex-col custom-scrollbar overflow-y-auto">
    <div class="flex justify-between items-center mb-6 shrink-0">
      <div>
        <h1 class="text-[28px] font-black text-slate-800 leading-none mb-1">Gestão de Tickets</h1>
        <p class="text-[13px] font-medium text-slate-400">Gerencie todos os tickets de atendimento</p>
      </div>
      <el-button type="primary" size="large" class="!rounded-xl !font-bold shadow-md shadow-blue-200"
        @click="openCreateModal">
        <el-icon class="mr-2">
          <Plus />
        </el-icon> Novo Ticket
      </el-button>
    </div>

    <TicketStats class="shrink-0" :total="total" :open="store.openTickets" :in-progress="store.inProgressTickets"
      :resolved="store.resolvedTickets" />

    <div v-if="loading && items.length === 0" class="flex justify-center p-10 flex-1 items-center">
      <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div v-else class="flex-1 flex flex-col min-h-0">
      <TicketFilters class="shrink-0" :model-value="filter.status || 'all'"
        @update:modelValue="store.setFilterStatus" />

      <TicketTable :tickets="items" @view="handleViewTicket" @edit="handleEditTicket" @delete="handleDeleteTicket" />
    </div>

    <TicketModal :is-open="isModalOpen" :ticket="currentTicket" :is-viewing="isViewing" @close="closeModal"
      @save="handleSave" @switch-edit="isViewing = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useTicketsStore } from '../store/tickets.store';
import TicketStats from '../components/TicketStats.vue';
import TicketFilters from '../components/TicketFilters.vue';
import TicketTable from '../components/TicketTable.vue';
import TicketModal from '../components/TicketModal.vue'; // <-- Importação do Modal restaurada
import type { ITicket } from '../../domain/entities/Ticket';

const store = useTicketsStore();
const { items, total, filter, loading } = storeToRefs(store);

const isModalOpen = ref(false);
const isViewing = ref(false);
const currentTicket = ref<ITicket | null>(null);

const openCreateModal = () => {
  currentTicket.value = null;
  isViewing.value = false;
  isModalOpen.value = true;
};

const handleViewTicket = (ticket: ITicket) => {
  currentTicket.value = ticket;
  isViewing.value = true;
  isModalOpen.value = true;
};

const handleEditTicket = (ticket: ITicket) => {
  currentTicket.value = ticket;
  isViewing.value = false;
  isModalOpen.value = true;
};

const handleDeleteTicket = async (id: number) => {
  try {
    await store.deleteTicket(id);
    ElMessage.success('Ticket excluído com sucesso!');
  } catch (error) {
    ElMessage.error('Erro ao excluir ticket.');
  }
};

const handleSave = async (data: Partial<ITicket>) => {
  try {
    if (currentTicket.value) {
      await store.updateTicket(currentTicket.value.id, data);
      ElMessage.success('Ticket atualizado com sucesso!');
    } else {
      await store.createTicket(data as Omit<ITicket, 'id' | 'createdAt'>);
      ElMessage.success('Ticket criado com sucesso!');
    }
    closeModal();
  } catch (error) {
    ElMessage.error('Ocorreu um erro ao salvar o ticket.');
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  currentTicket.value = null;
  isViewing.value = false;
};

onMounted(() => {
  store.fetch();
});
</script>