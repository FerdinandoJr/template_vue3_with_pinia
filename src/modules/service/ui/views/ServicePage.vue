<template>
  <div class="h-full space-y-6">
    <div class="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div class="relative flex-1 max-w-md">
        <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
        <input 
          :value="filter.query"
          @input="handleSearch"
          type="text" 
          placeholder="Pesquisar atendimentos..." 
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        >
      </div>

      <button 
        @click="isRegisterModalOpen = true"
        class="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition flex items-center gap-2"
      >
        <span>+</span> Simular Fim de Chat
      </button>
    </div>

    <div v-if="loading" class="flex justify-center p-10">
      <span class="text-slate-500 animate-pulse">Carregando histórico...</span>
    </div>

    <ServiceTable v-else :records="items" />

    <FinishServiceModal 
        :is-open="isRegisterModalOpen"
        @close="isRegisterModalOpen = false"
        @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useServiceStore, type FinishServicePayload } from '../store/service.store';
import ServiceTable from '../components/ServiceTable.vue';
import FinishServiceModal from '../components/FinishServiceModal.vue';

const store = useServiceStore();
const { items, filter, loading } = storeToRefs(store);

const isRegisterModalOpen = ref(false);

let searchTimeout: ReturnType<typeof setTimeout>;
const handleSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.setQuery(value);
  }, 300);
};

const handleSave = async (data: FinishServicePayload) => {
    await store.registerFinish(data);
    isRegisterModalOpen.value = false;
};

onMounted(() => {
    store.fetch();
});
</script>