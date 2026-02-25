<template>
  <div class="space-y-6 p-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Visão Geral</h2>
        <p class="text-slate-400 text-sm font-medium">Acompanhe o desempenho em tempo real</p>
      </div>
      
      <DashboardFilters 
        :current="currentPeriod" 
        @update:period="handlePeriodChange" 
      />
    </div>

    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Total Clientes" :value="stats.totalCustomers" icon="👥" color="bg-blue-500" />
      <StatCard title="Tickets Ativos" :value="stats.activeTickets" icon="🎫" color="bg-amber-500" />
      <StatCard title="Resolvidos Hoje" :value="stats.resolvedToday" icon="✅" color="bg-green-500" />
      <StatCard title="Tempo Médio" :value="stats.averageResponseTime" icon="⏱️" color="bg-purple-500" />
    </div>

    <div v-if="stats" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <h3 class="font-extrabold text-slate-800 mb-4 uppercase text-[12px] tracking-widest text-slate-400">Volume de Atendimento</h3>
        <apexchart type="area" height="300" :options="areaOptions" :series="areaSeries" />
      </div>
      <div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <h3 class="font-extrabold text-slate-800 mb-4 uppercase text-[12px] tracking-widest text-slate-400">Status dos Tickets</h3>
        <apexchart type="donut" height="300" :options="donutOptions" :series="stats.ticketDistribution" />
      </div>
    </div>

    <div v-if="loading" class="fixed inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
      <div class="bg-white p-5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-black text-slate-700 uppercase tracking-tighter">Atualizando...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../store/dashboard.store';
import { DashboardPeriod } from '../../domain/valueObjects/dashboard-period.enum';
import DashboardFilters from '../components/DashboardFilters.vue';
import StatCard from '../components/StatCard.vue';

const store = useDashboardStore();
const { stats, loading, currentPeriod } = storeToRefs(store);

const handlePeriodChange = (newPeriod: DashboardPeriod) => {
  store.setPeriod(newPeriod);
};

onMounted(() => {
  store.fetchDashboardData();
});

const areaSeries = computed(() => [{ name: 'Atendimentos', data: stats.value?.revenueData || [] }]);
const areaOptions = {
  chart: { toolbar: { show: false } },
  stroke: { curve: 'smooth', width: 3 },
  colors: ['#3b82f6'],
  xaxis: { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] }
};
const donutOptions = {
  labels: ['Abertos', 'Em Progresso', 'Resolvidos'],
  colors: ['#f59e0b', '#3b82f6', '#10b981'],
  legend: { position: 'bottom' }
};
</script>