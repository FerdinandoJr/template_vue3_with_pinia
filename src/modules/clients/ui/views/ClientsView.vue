<template>
  <div class="flex flex-col h-[calc(100vh-100px)] gap-6">
    <ClientStats 
      :total="totalClients"
      :with-tickets="clientsWithTickets"
      :critical="criticalClients"
    />

    <ClientTable 
      :clients="filteredClients"
      v-model:searchQuery="searchQuery"
      @select="openClientDrawer"
    />

    <ClientDrawer 
      :is-open="isDrawerOpen" 
      :client="activeClient" 
      @close="closeDrawer" 
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useClientsStore } from '../store/clients.store';
import ClientStats from '../components/ClientStats.vue';
import ClientTable from '../components/ClientTable.vue';
import ClientDrawer from '../components/ClientDrawer.vue';

const store = useClientsStore();
const { 
  filteredClients, 
  activeClient, 
  isDrawerOpen, 
  totalClients, 
  clientsWithTickets, 
  criticalClients, 
  searchQuery 
} = storeToRefs(store);

const { loadClients, openClientDrawer, closeDrawer } = store;

onMounted(() => {
  loadClients();
});
</script>