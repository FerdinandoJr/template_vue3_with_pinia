<template>
  <div class="h-full space-y-6">
    <div class="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div class="relative flex-1 max-w-md">
        <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
        <input 
          v-model="store.searchQuery"
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

    <ServiceTable :records="store.filteredRecords" />

    <FinishServiceModal 
        :is-open="isRegisterModalOpen"
        @close="isRegisterModalOpen = false"
        @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAtendimentosStore } from '../store/atendimentos.store';
import ServiceTable from '../components/ServiceTable.vue';
import FinishServiceModal from '../components/FinishServiceModal.vue';

const store = useAtendimentosStore();

const isRegisterModalOpen = ref(false);

const handleSave = async (data: any) => {
    await store.registerFinish(data);
    isRegisterModalOpen.value = false;
};

onMounted(() => {
    store.loadRecords();
});
</script>