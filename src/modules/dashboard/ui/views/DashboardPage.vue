<template>
  <div class="p-6 h-full flex flex-col">
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Visão Geral</h2>
        <p class="text-slate-400 text-sm font-medium">Acompanhe o desempenho em tempo real</p>
      </div>
      <DashboardFilters :current="currentPeriod" @update:period="handlePeriodChange" />
    </div>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-row :gutter="24" class="mb-6">
          <el-col :xs="24" :sm="12" :lg="6" v-for="i in 4" :key="i" class="mb-4 lg:mb-0">
            <el-card class="!rounded-[16px] border-none shadow-sm h-[100px] flex items-center">
              <div class="flex justify-between items-center w-full">
                <div class="flex flex-col gap-2">
                  <el-skeleton-item variant="text" style="width: 80px; height: 12px" />
                  <el-skeleton-item variant="h1" style="width: 50px; height: 24px" />
                </div>
                <el-skeleton-item variant="circle" style="width: 48px; height: 48px" />
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :lg="12" class="mb-4 lg:mb-0">
            <el-card class="!rounded-[24px] border-none shadow-sm h-[380px]">
              <el-skeleton-item variant="rect" style="width: 100%; height: 100%" />
            </el-card>
          </el-col>
          <el-col :xs="24" :lg="12">
            <el-card class="!rounded-[24px] border-none shadow-sm h-[380px]">
              <el-skeleton-item variant="rect" style="width: 100%; height: 100%" />
            </el-card>
          </el-col>
        </el-row>
      </template>

      <template #default>
        <template v-if="stats">
          <el-row :gutter="24" class="mb-6">
            <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
              <StatCard title="Total Clientes" :value="stats.totalCustomers" :icon="RawUser"
                border-color="!border-l-blue-500" icon-color="text-blue-500"
                tooltip="Número total de clientes ativos na base" />
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
              <StatCard title="Tickets Ativos" :value="stats.activeTickets" :icon="RawTicket"
                border-color="!border-l-amber-500" icon-color="text-amber-500"
                tooltip="Soma dos tickets nas etapas: A fazer e Em Progresso" />
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
              <StatCard title="Resolvidos Hoje" :value="stats.resolvedToday" :icon="RawCheck"
                border-color="!border-l-green-500" icon-color="text-green-500"
                tooltip="Tickets marcados como resolvidos no dia atual" />
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6" class="mb-4 lg:mb-0">
              <StatCard title="Tempo Médio" :value="stats.averageResponseTime" :icon="RawTimer"
                border-color="!border-l-purple-500" icon-color="text-purple-500"
                tooltip="Calculado com base na diferença entre a abertura e a 1ª resposta" />
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :xs="24" :lg="12" class="mb-4 lg:mb-0">
              <VolumeChart v-if="renderCharts" :data="stats.revenueData" />
            </el-col>
            <el-col :xs="24" :lg="12">
              <StatusChart v-if="renderCharts" :data="stats.ticketDistribution" />
            </el-col>
          </el-row>
        </template>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw, nextTick, watch } from 'vue';
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

// Controle de renderização segura para ApexCharts
const renderCharts = ref(false);

const RawUser = markRaw(User);
const RawTicket = markRaw(Ticket);
const RawCheck = markRaw(Check);
const RawTimer = markRaw(Timer);

watch(loading, async (newVal) => {
  if (!newVal) {
    await nextTick();
    renderCharts.value = true;
  } else {
    renderCharts.value = false;
  }
}, { immediate: true });

const handlePeriodChange = (newPeriod: DashboardPeriod) => {
  if (newPeriod !== currentPeriod.value) {
    renderCharts.value = false;
    store.setPeriod(newPeriod);
  }
};

onMounted(() => {
  store.fetchDashboardData();
});
</script>