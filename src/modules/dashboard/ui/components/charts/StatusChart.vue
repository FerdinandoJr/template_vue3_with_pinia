<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
    <h3 class="font-bold text-slate-800 text-lg mb-6">Status dos Tickets</h3>
    <div class="flex-1 flex items-center justify-center min-h-[250px]">
      <apexchart type="donut" width="320" :options="chartOptions" :series="series"></apexchart>
    </div>
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div class="text-center p-3 bg-slate-50 rounded-lg">
        <div class="text-xs text-slate-500">Resolvidos</div>
        <div class="text-lg font-bold text-slate-800">68%</div>
      </div>
      <div class="text-center p-3 bg-slate-50 rounded-lg">
        <div class="text-xs text-slate-500">Pendentes</div>
        <div class="text-lg font-bold text-slate-800">32%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineProps<{ series: number[] }>();

const chartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: ['Abertos', 'Resolvidos', 'Pendentes'],
  colors: ['#3b82f6', '#10b981', '#f59e0b'],
  legend: { position: 'bottom' },
  plotOptions: { pie: { donut: { size: '65%', labels: { show: true, name: { show: true }, value: { show: true, fontSize: '24px', fontWeight: 600 } } } } },
  dataLabels: { enabled: false }
}));
</script>