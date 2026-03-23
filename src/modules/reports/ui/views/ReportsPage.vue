<template>
  <div class="h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar bg-[#f8fafd] p-8">
    <div class="max-w-[1400px] mx-auto flex flex-col h-full">
      
      <div class="flex justify-between items-start mb-8 shrink-0">
        <div>
          <h1 class="text-[28px] font-black text-slate-800 mb-1 leading-none">Relatórios Gerenciais</h1>
          <p class="text-[13px] font-medium text-slate-400">Acompanhe as métricas de desempenho</p>
        </div>
        
        <div class="relative w-[300px]">
          <span class="absolute left-4 top-3 text-slate-400 text-sm">🔍</span>
          <input 
            type="text" 
            placeholder="Pesquisar em todo o sistema..." 
            class="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-500 transition-colors" 
          />
        </div>
      </div>

      <div v-if="store.data" class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        <div class="lg:col-span-8">
          <VolumeWidget :data="store.data.volume" />
        </div>
        <div class="lg:col-span-4">
          <TicketsStatusWidget :data="store.data.ticketStatus" />
        </div>

        <div class="lg:col-span-6">
          <TeamPerformanceWidget :data="store.data.teamPerformance" />
        </div>
        <div class="lg:col-span-6">
          <ResponseTimeWidget :data="store.data.responseTimes" />
        </div>

        <div class="lg:col-span-12">
          <FinishedChatsWidget />
        </div>

      </div>

      <div v-else class="flex-1 flex items-center justify-center">
        <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useReportsStore } from '../store/reports.store';
import VolumeWidget from '../components/VolumeWidget.vue';
import TicketsStatusWidget from '../components/TicketsStatusWidget.vue';
import TeamPerformanceWidget from '../components/TeamPerformanceWidget.vue';
import ResponseTimeWidget from '../components/ResponseTimeWidget.vue';
import FinishedChatsWidget from '../components/FinishedChatsWidget.vue';

const store = useReportsStore();

onMounted(() => {
  store.fetchReports();
});
</script>