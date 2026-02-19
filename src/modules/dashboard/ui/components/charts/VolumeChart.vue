<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
    <div class="flex justify-between items-center mb-6 flex-shrink-0">
      <h3 class="font-bold text-slate-800 text-lg">Volume de Atendimentos</h3>
      <select class="bg-slate-50 border-none text-sm rounded-lg px-3 py-1.5 text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none">
        <option>Últimos 7 dias</option>
        <option>Este Mês</option>
      </select>
    </div>
    <div class="flex-1 min-h-0 relative">
      <apexchart 
        type="area" 
        height="100%"
        width="100%"
        :options="chartOptions" 
        :series="series"
        class="absolute inset-0"
      ></apexchart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChartSeries } from '../../../domain/entities/DashboardTypes';

defineProps<{ series: ChartSeries[] }>();

const chartOptions = computed(() => ({
  chart: { 
    type: 'area', 
    height: '100%', 
    toolbar: { show: false }, 
    fontFamily: 'inherit',
    parentHeightOffset: 0 
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#3b82f6', '#10b981'],
  xaxis: {
    categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748b', fontSize: '12px' } }
  },
  yaxis: {
    labels: { style: { colors: '#64748b', fontSize: '12px' } }
  },
  grid: { 
    borderColor: '#f1f5f9',
    strokeDashArray: 4, 
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 0, bottom: 0, left: 10 } 
  },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
  tooltip: {
    theme: 'light',
    style: { fontSize: '12px', fontFamily: 'inherit' },
    x: { show: false }
  }
}));
</script>