<template>
  <div class="p-6 md:p-8 flex flex-col gap-6 w-full min-h-screen bg-slate-50/50">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Visão Geral</h2>
        <p class="text-slate-500 text-sm font-medium mt-1">
          {{
            authStore.user?.role === 'AGENT'
              ? 'Acompanhe o seu desempenho pessoal'
              : 'Acompanhe o desempenho geral em tempo real'
          }}
        </p>
      </div>

      <DashboardFilters :current="store.currentPeriod" @update:period="handlePeriodChange" />
    </div>

    <div v-if="store.loading" class="flex flex-col items-center justify-center py-24 w-full h-full">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p class="text-slate-400 font-medium">A carregar dados do dashboard...</p>
    </div>

    <div v-else-if="store.stats" class="flex flex-col gap-6">

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de Clientes" :value="store.stats.totalCustomers" :icon="RawUsers"
          border-color="!border-l-blue-500" icon-color="text-blue-500" tooltip="Número total de clientes na base" />
        <StatCard title="Tickets Ativos" :value="store.stats.activeTickets" :icon="RawTicket"
          border-color="!border-l-amber-500" icon-color="text-amber-500"
          tooltip="Tickets que ainda estão em andamento" />
        <StatCard title="Resolvidos Hoje" :value="store.stats.resolvedToday" :icon="RawCheck"
          border-color="!border-l-green-500" icon-color="text-green-500"
          tooltip="Atendimentos finalizados no dia de hoje" />
        <StatCard title="Tempo Médio" :value="store.stats.averageResponseTime" :icon="RawTimer"
          border-color="!border-l-indigo-500" icon-color="text-indigo-500"
          tooltip="Tempo médio de resposta aos clientes" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 class="text-lg font-bold text-slate-800 mb-6">Volume de Atendimentos</h3>
          <div class="flex-1 min-h-[300px]">
            <VolumeChart :key="store.currentPeriod + 'volume'" :data="store.stats.revenueData" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 class="text-lg font-bold text-slate-800 mb-6">Distribuição por Status</h3>
          <div class="flex-1 min-h-[300px]">
            <StatusChart :key="store.currentPeriod + 'status'" :data="store.stats.ticketDistribution" />
          </div>
        </div>

      </div>
    </div>

    <div v-else class="flex items-center justify-center py-20 text-slate-400">
      <p>Nenhum dado disponível para o período selecionado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, markRaw } from 'vue';
import { useDashboardStore } from '../store/dashboard.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { DashboardPeriod } from '../../domain/valueObjects/dashboard-period.enum';
import DashboardFilters from '../components/DashboardFilters.vue';
import StatCard from '../components/StatCard.vue';
import StatusChart from '../components/StatusChart.vue';
import VolumeChart from '../components/VolumeChart.vue';
import { Users, Ticket, Check, Timer } from 'lucide-vue-next';

const store = useDashboardStore();
const authStore = useAuthStore();
const RawUsers = markRaw(Users);
const RawTicket = markRaw(Ticket);
const RawCheck = markRaw(Check);
const RawTimer = markRaw(Timer);

const handlePeriodChange = (newPeriod: DashboardPeriod) => {
  store.setPeriod(newPeriod);
};

onMounted(async () => {
  await store.fetchDashboardData();
});
</script>