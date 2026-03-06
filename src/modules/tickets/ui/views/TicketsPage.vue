<template>
  <div v-if="loading" class="flex justify-center p-10">
    <span class="text-slate-500 animate-pulse">Carregando tickets...</span>
  </div>

  <div v-else>
    <TicketStats :total="total" :open="store.openTickets" :in-progress="store.inProgressTickets"
      :resolved="store.resolvedTickets" />

    <TicketFilters :model-value="filter.status || 'all'" @update:model-value="store.setFilterStatus" />

    <TicketTable :tickets="items" @view="handleViewTicket" @edit="handleEditTicket" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTicketsStore } from '../store/tickets.store';
import TicketStats from '../components/TicketStats.vue';
import TicketFilters from '../components/TicketFilters.vue';
import TicketTable from '../components/TicketTable.vue';

const store = useTicketsStore();
const { items, total, filter, loading } = storeToRefs(store);

const handleViewTicket = (id: number) => console.log('Ver ticket', id);
const handleEditTicket = (id: number) => console.log('Editar ticket', id);

onMounted(() => {
  store.fetch();
});
</script>