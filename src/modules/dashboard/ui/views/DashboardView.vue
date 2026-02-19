<template>
  <div class="space-y-6">
    <div v-if="store.loading" class="flex justify-center p-10">
      <span class="text-slate-400 animate-pulse">Carregando dados...</span>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          v-for="(stat, index) in store.data.stats" 
          :key="index"
          v-bind="stat"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div class="lg:col-span-2 h-full"> <VolumeChart :series="store.data.volumeSeries" class="h-full" /> </div>
        <div class="h-full"> <StatusChart :series="store.data.statusSeries" class="h-full" /> </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <PerformanceChart :series="store.data.performanceSeries" class="h-full" />
        <RecentActivityList :activities="store.data.recentActivity" class="h-full" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '../store/dashboard.store';
import StatCard from '../components/StatCard.vue';
import VolumeChart from '../components/charts/VolumeChart.vue';
import StatusChart from '../components/charts/StatusChart.vue';
import PerformanceChart from '../components/charts/PerformanceChart.vue';
import RecentActivityList from '../components/RecentActivityList.vue';

const store = useDashboardStore();

onMounted(() => {
  store.loadDashboard();
});
</script>