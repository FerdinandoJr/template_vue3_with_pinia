<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <h3 class="font-bold text-slate-800 text-lg mb-6">Desempenho por Atendente</h3>
    <apexchart type="bar" height="250" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChartSeries } from '../../../domain/entities/DashboardTypes';

defineProps<{ series: ChartSeries[] }>();

const chartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '50%' } },
  dataLabels: { enabled: false },
  colors: ['#6366f1'],
  xaxis: { categories: ['Ana Silva', 'Carlos M.', 'João P.', 'Maria O.', 'Pedro S.'] },
  grid: { show: false }
}));
</script>