<template>
  <div class="p-6 h-full flex flex-col" v-loading.fullscreen.lock="loading"
    element-loading-text="Atualizando Dashboard...">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Visão Geral</h2>
        <p class="text-slate-400 text-sm font-medium">Acompanhe o desempenho em tempo real</p>
      </div>
      <DashboardFilters :current="currentPeriod" @update:period="handlePeriodChange" />
    </div>

    <template v-if="stats && !loading">

      <el-row :gutter="24" class="mb-6">
        <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
          <StatCard title="Total Clientes" :value="stats.totalCustomers" :icon="User" color="bg-blue-500" />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
          <StatCard title="Tickets Ativos" :value="stats.activeTickets" :icon="Ticket" color="bg-amber-500" />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
          <StatCard title="Resolvidos Hoje" :value="stats.resolvedToday" :icon="Check" color="bg-green-500" />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
          <StatCard title="Tempo Médio" :value="stats.averageResponseTime" :icon="Timer" color="bg-purple-500" />
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :xs="24" :lg="12" class="mb-4 lg:mb-0">
          <VolumeChart :data="stats.revenueData" />
        </el-col>
        <el-col :xs="24" :lg="12">
          <StatusChart :data="stats.ticketDistribution" />
        </el-col>
      </el-row>

    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '../store/dashboard.store';
import { DashboardPeriod } from '../../domain/valueObjects/dashboard-period.enum';
import { User, Ticket, Check, Timer } from '@element-plus/icons-vue';
import DashboardFilters from '../components/DashboardFilters.vue';
import StatCard from '../components/StatCard.vue';
import VolumeChart from '../components/VolumeChart.vue';
import StatusChart from '../components/StatusChart.vue';

const store = useDashboardStore();
const { stats, loading, currentPeriod } = storeToRefs(store);

const handlePeriodChange = (newPeriod: DashboardPeriod) => {
  store.setPeriod(newPeriod);
};

onMounted(() => {
  store.fetchDashboardData();
});
</script>