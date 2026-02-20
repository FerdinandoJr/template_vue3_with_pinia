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
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useClientsStore } from '../store/clients.store';
import type { Client } from '../../domain/entities/Client';
import ClientStats from '../components/ClientStats.vue';
import ClientTable from '../components/ClientTable.vue';
import ClientDrawer from '../components/ClientDrawer.vue';

const store = useClientsStore();
const { filteredClients, totalClients, clientsWithTickets, criticalClients, searchQuery } = storeToRefs(store);

// Controle de UI local
const isDrawerOpen = ref(false);
const selectedClientId = ref<number | null>(null);

const activeClient = computed<Client | undefined>(() => {
    return selectedClientId.value ? store.getClientById(selectedClientId.value) : undefined;
});

const openClientDrawer = (id: number) => {
    selectedClientId.value = id;
    isDrawerOpen.value = true;
};

const closeDrawer = () => {
    isDrawerOpen.value = false;
    setTimeout(() => selectedClientId.value = null, 300);
};

onMounted(() => {
  store.loadClients();
});
</script>