<template>
  <div class="h-full flex flex-col bg-[#f8fafc]">
    
    <div class="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar space-y-8">
      
      <div v-if="store.loading" class="flex justify-center p-10">
          <span class="text-slate-400 font-bold animate-pulse">Carregando relatórios...</span>
      </div>

      <template v-else-if="store.metrics">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <WeeklyVolumeChart :data="store.metrics.weeklyVolume" />
              <StatusDistributionChart :data="store.metrics.statusDistribution" />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
              <TeamPerformanceCard :data="store.metrics.teamPerformance" />
              <ResponseTimeTable :data="store.metrics.responseTimes" />
          </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useReportsStore } from '../store/reports.store';
import WeeklyVolumeChart from '../components/WeeklyVolumeChart.vue';
import StatusDistributionChart from '../components/StatusDistributionChart.vue';
import TeamPerformanceCard from '../components/TeamPerformanceCard.vue';
import ResponseTimeTable from '../components/ResponseTimeTable.vue';

const store = useReportsStore();

onMounted(() => {
    store.loadMetrics();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>