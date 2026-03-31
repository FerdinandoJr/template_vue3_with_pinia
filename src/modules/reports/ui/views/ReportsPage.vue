<template>
  <div class="p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col gap-6 overflow-y-auto custom-scroll">

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
      <div>
        <h2 class="text-2xl font-black text-slate-800 tracking-tight">Relatórios Gerenciais</h2>
        <p class="text-slate-500 text-sm font-medium mt-1">Visão 360º de produtividade, gargalos e eficiência da equipe
        </p>
      </div>

      <div class="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 shrink-0">
        <el-date-picker v-model="store.dateRange" type="daterange" range-separator="até" start-placeholder="Início"
          end-placeholder="Fim" format="DD/MM/YYYY" class="!border-none w-64" />
        <el-button type="primary" class="!rounded-xl shadow-md shadow-blue-200">
          <el-icon class="mr-2">
            <Download />
          </el-icon> Exportar
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Total</p>
          <p class="text-3xl font-black text-slate-800">{{ store.generalStats.total }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <el-icon :size="20">
            <Document />
          </el-icon>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aguardando na Fila</p>
          <p class="text-3xl font-black text-orange-500">{{ store.generalStats.waiting }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
          <el-icon :size="20">
            <Timer />
          </el-icon>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Andamento</p>
          <p class="text-3xl font-black text-blue-500">{{ store.generalStats.ongoing }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <el-icon :size="20">
            <ChatLineRound />
          </el-icon>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Concluídos</p>
          <p class="text-3xl font-black text-green-500">{{ store.generalStats.finished }}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
          <el-icon :size="20">
            <Check />
          </el-icon>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">

      <div
        class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
        <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 w-full text-left">Meta de SLA Global
        </h3>
        <el-progress type="dashboard" :percentage="store.slaStats.percent" :stroke-width="12" :color="colors"
          :width="160">
          <template #default="{ percentage }">
            <div class="flex flex-col">
              <span class="text-3xl font-black text-slate-800">{{ percentage }}%</span>
              <span class="text-[9px] text-slate-400 font-bold uppercase">No Prazo</span>
            </div>
          </template>
        </el-progress>
        <div class="grid grid-cols-2 gap-4 mt-2 w-full border-t border-slate-100 pt-4">
          <div>
            <p class="text-xl font-bold text-green-500">{{ store.slaStats.within }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dentro da Meta</p>
          </div>
          <div>
            <p class="text-xl font-bold text-red-400">{{ store.slaStats.exceeded }}</p>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Atrasados</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 grid grid-cols-2 gap-5">
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <el-icon>
              <Timer />
            </el-icon> Tempo Médio de Espera (TME)</p>
          <p class="text-3xl font-black text-orange-500 font-mono">{{ store.qualityMetrics.avgWaitTime }}</p>
          <p class="text-xs text-slate-500 font-medium mt-1">Tempo médio do cliente na fila</p>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <el-icon>
              <Clock />
            </el-icon> Tempo Médio Atend. (TMA)</p>
          <p class="text-3xl font-black text-blue-500 font-mono">{{ store.qualityMetrics.avgServiceTime }}</p>
          <p class="text-xs text-slate-500 font-medium mt-1">Tempo efetivo de conversa</p>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <el-icon>
              <DataLine />
            </el-icon> Taxa de Resolução</p>
          <div class="flex items-end gap-3">
            <p class="text-3xl font-black text-green-500">{{ store.qualityMetrics.resolutionRate }}%</p>
            <el-progress :percentage="store.qualityMetrics.resolutionRate" :show-text="false" color="#22c55e"
              class="flex-1 mb-2" />
          </div>
        </div>

        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <el-icon>
              <Star />
            </el-icon> Satisfação Média (CSAT)</p>
          <div class="flex items-center gap-3">
            <p class="text-3xl font-black text-amber-500">{{ store.qualityMetrics.avgSatisfaction }}</p>
            <el-rate :model-value="Number(store.qualityMetrics.avgSatisfaction)" disabled allow-half
              text-color="#f59e0b" class="!h-auto mt-1" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 mb-6">

      <div
        class="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest">Desempenho por Atendente</h3>
        </div>

        <div class="flex-1 overflow-y-auto">
          <el-table :data="store.agentPerformance" style="width: 100%" class="enterprise-table" height="280">
            <el-table-column label="Atendente" min-width="180">
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <el-avatar :size="28" class="bg-blue-600 text-white font-bold text-[10px]">
                    {{ row.name.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <span class="font-bold text-slate-700 text-sm">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="total" label="Abertos" align="center" width="90" />
            <el-table-column prop="finished" label="Resolvidos" align="center" width="110">
              <template #default="{ row }"><span class="text-green-600 font-bold">{{ row.finished }}</span></template>
            </el-table-column>

            <el-table-column label="TMA" align="center" width="90">
              <template #default="{ row }"><span class="font-mono font-bold text-slate-600">{{ row.avgTime
                  }}</span></template>
            </el-table-column>

            <el-table-column label="Satisfação" width="150" align="center">
              <template #default="{ row }">
                <div v-if="row.satisfactionScore > 0">
                  <el-rate :model-value="row.satisfactionScore" disabled allow-half text-color="#f59e0b"
                    class="!h-auto scale-90" />
                </div>
                <span v-else class="text-[10px] text-slate-400 font-bold uppercase">S/ Nota</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest">Horários de Pico</h3>
        </div>

        <div class="p-6 flex-1 flex items-end gap-2 justify-between h-[280px]">
          <div v-for="item in store.hourlyVolume" :key="item.hour"
            class="flex flex-col items-center gap-2 flex-1 group">
            <el-tooltip :content="`${item.count} chamados`" placement="top">
              <div
                class="w-full bg-blue-100 group-hover:bg-blue-500 rounded-t-md transition-all duration-300 relative min-h-[4px]"
                :style="`height: ${item.heightPercent}%`"></div>
            </el-tooltip>
            <span class="text-[9px] font-bold text-slate-400 rotate-[-45deg] origin-top-left mt-2">{{ item.hour
              }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col shrink-0 mb-6">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
        <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest">Volume por Departamento / Fila</h3>
      </div>

      <div class="p-6">
        <div v-if="store.volumeByDepartment.length === 0" class="text-center text-slate-400 py-8">
          Nenhum dado departamental disponível.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-6">
          <div v-for="dept in store.volumeByDepartment" :key="dept.name" class="flex flex-col gap-2">
            <div class="flex justify-between items-end">
              <span class="text-sm font-bold text-slate-700 truncate pr-4">{{ dept.name }}</span>
              <span class="text-xs font-black text-slate-400 shrink-0">{{ dept.count }} chamados ({{ dept.percentage
                }}%)</span>
            </div>
            <el-progress :percentage="dept.percentage" :stroke-width="10" :show-text="false" color="#3b82f6" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useReportsStore } from '../store/reports.store';
import { Download, Document, Timer, ChatLineRound, Check, Clock, DataLine, Star } from '@element-plus/icons-vue';

const store = useReportsStore();

const colors = [
  { color: '#ef4444', percentage: 20 },
  { color: '#f59e0b', percentage: 50 },
  { color: '#3b82f6', percentage: 80 },
  { color: '#22c55e', percentage: 100 },
];
</script>

<style scoped>
.enterprise-table :deep(.el-table__header) {
  background-color: #f8fafc;
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.enterprise-table :deep(.el-table__row) {
  transition: background-color 0.2s ease-in-out;
  cursor: default;
}

.enterprise-table :deep(.el-table__row:hover) {
  background-color: rgba(248, 250, 252, 0.5);
}

.enterprise-table :deep(.el-rate__icon) {
  margin-right: 0px;
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
}
</style>