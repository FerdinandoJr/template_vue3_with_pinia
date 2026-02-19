<template>
  <div v-if="loading" class="flex justify-center p-10">
    <span class="text-slate-500 animate-pulse">Carregando tickets...</span>
  </div>
  
  <div v-else>
    <TicketStats 
      :total="totalTickets"
      :open="openTickets"
      :in-progress="inProgressTickets"
      :resolved="resolvedTickets"
    />

    <TicketFilters 
      :model-value="filter" 
      @update:model-value="setFilter" 
    />

    <TicketTable 
      :tickets="filteredTickets" 
      @view="handleViewTicket"
      @edit="handleEditTicket"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTicketsStore } from '../store/tickets.store';
import TicketStats from '../components/TicketStats.vue';
import TicketFilters from '../components/TicketFilters.vue';
import TicketTable from '../components/TicketTable.vue';

const ticketsStore = useTicketsStore();
const { filteredTickets, totalTickets, openTickets, inProgressTickets, resolvedTickets, filter, loading } = storeToRefs(ticketsStore);
const { loadTickets, setFilter } = ticketsStore;

const handleViewTicket = (id: number) => console.log('Ver ticket', id);
const handleEditTicket = (id: number) => console.log('Editar ticket', id);

onMounted(() => {
  loadTickets();
});
</script>