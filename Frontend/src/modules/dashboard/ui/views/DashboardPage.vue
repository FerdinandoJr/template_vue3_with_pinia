<template>
  <div class="flex flex-col gap-6 animate-fade-in pb-8">
    
    <div class="relative w-full bg-blue-600 rounded-[24px] overflow-hidden shadow-lg shadow-blue-600/20">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-90"></div>
      
      <div class="absolute top-[-50%] right-[-5%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-[-20%] left-[10%] w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
      
      <div class="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Olá, {{ userName }}! 👋
          </h1>
          <p class="text-blue-100 font-medium text-sm sm:text-base max-w-xl leading-relaxed">
            <template v-if="isAdminOrManager">
              Visão Geral da Operação: A equipe tem <strong class="text-white">{{ kpiData.ticketsPendentes }} tickets pendentes</strong> aguardando resolução.
            </template>
            <template v-else>
              Seu Resumo: Você tem <strong class="text-white">{{ kpiData.ticketsPendentes }} tickets designados</strong> para você hoje. Bom trabalho!
            </template>
          </p>
        </div>
        <div class="shrink-0 flex gap-3">
          <el-button v-if="isAdminOrManager" class="!bg-white/10 hover:!bg-white/20 !border-white/20 !text-white !rounded-xl !h-12 !px-6 !font-bold backdrop-blur-sm transition-all">
            <el-icon class="mr-2"><Download /></el-icon> Relatório Gerencial
          </el-button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
            <el-icon class="text-xl"><ChatDotRound /></el-icon>
          </div>
          <span v-if="isAdminOrManager" class="flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <el-icon><TopRight /></el-icon> +14%
          </span>
        </div>
        <div>
          <h3 class="text-3xl font-black text-slate-800 tracking-tight">{{ kpiData.chatsAtivos }}</h3>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {{ isAdminOrManager ? 'Chats Ativos (Equipe)' : 'Meus Chats Ativos' }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100/50">
            <el-icon class="text-xl"><Ticket /></el-icon>
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-black text-slate-800 tracking-tight">{{ kpiData.ticketsPendentes }}</h3>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {{ isAdminOrManager ? 'Tickets Pendentes Globais' : 'Meus Tickets Pendentes' }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
            <el-icon class="text-xl"><CircleCheck /></el-icon>
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-black text-slate-800 tracking-tight">{{ kpiData.taxaResolucao }}%</h3>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Taxa de Resolução</p>
        </div>
      </div>

      <div class="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300">
        <div class="flex justify-between items-start mb-4">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/50">
            <el-icon class="text-xl"><Timer /></el-icon>
          </div>
        </div>
        <div>
          <h3 class="text-3xl font-black text-slate-800 tracking-tight">{{ kpiData.tma }}<span class="text-lg text-slate-400 font-bold ml-1">min</span></h3>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            {{ isAdminOrManager ? 'T.M.A. Global' : 'Meu T.M.A.' }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <el-icon class="text-blue-500"><DataLine /></el-icon> Volume de Atendimentos
            </h2>
            <p class="text-xs font-medium text-slate-500 mt-1">Comparativo de Chats vs Tickets nos últimos 7 dias</p>
          </div>
          <el-select v-model="chartPeriod" class="w-32 custom-header-select">
            <el-option label="Últimos 7 dias" value="7d" />
            <el-option label="Últimos 15 dias" value="15d" />
          </el-select>
        </div>
        <div class="flex-1 min-h-[300px] w-full">
          <apexchart type="area" height="100%" :options="areaChartOptions" :series="areaChartSeries" />
        </div>
      </div>

      <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col">
        <div class="mb-6">
          <h2 class="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <el-icon class="text-amber-500"><PieChart /></el-icon> Status do Kanban
          </h2>
          <p class="text-xs font-medium text-slate-500 mt-1">Distribuição atual dos tickets</p>
        </div>
        <div class="flex-1 flex items-center justify-center min-h-[300px]">
          <apexchart type="donut" width="100%" :options="donutChartOptions" :series="donutChartSeries" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 class="text-base font-black text-slate-800 tracking-tight">
            {{ isAdminOrManager ? 'Tickets Críticos da Equipe' : 'Meus Tickets Críticos' }}
          </h2>
          <el-button link type="primary" class="!font-bold !text-xs" @click="$router.push('/kanban')">Ver Kanban</el-button>
        </div>
        
        <div class="p-0 no-scrollbar overflow-y-auto max-h-[340px]">
          <div v-if="filteredTickets.length === 0" class="p-8 text-center text-slate-400 font-bold text-sm">
            Nenhum ticket pendente no momento.
          </div>
          
          <div v-for="(ticket, idx) in filteredTickets" :key="idx" 
               class="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-[10px]"
                   :class="getPriorityColors(ticket.priority)">
                {{ ticket.priorityLabel }}
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate max-w-[180px] sm:max-w-[280px]">{{ ticket.title }}</h4>
                <p class="text-xs text-slate-500 mt-0.5 truncate">
                  {{ ticket.customer }} • {{ ticket.date }} 
                  <span v-if="isAdminOrManager" class="font-bold text-slate-400"> • Resp: {{ ticket.assignee }}</span>
                </p>
              </div>
            </div>
            <div class="shrink-0 flex items-center gap-3">
              <span class="hidden sm:inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider"
                    :class="ticket.status === 'A Fazer' ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600'">
                {{ ticket.status }}
              </span>
              <el-icon class="text-slate-300 group-hover:text-blue-500"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 class="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
            <el-icon class="text-red-500"><WarningFilled /></el-icon> 
            {{ isAdminOrManager ? 'Alertas de SLA (Equipe)' : 'Meus Alertas de SLA' }}
          </h2>
          <span v-if="filteredAlerts.length > 0" class="bg-red-100 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
            {{ filteredAlerts.length }} Pendências
          </span>
        </div>
        
        <div class="p-4 sm:p-5 flex flex-col gap-3 no-scrollbar overflow-y-auto max-h-[340px]">
          
          <div v-if="filteredAlerts.length === 0" class="flex-1 flex flex-col items-center justify-center py-8 text-center bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-100">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3 shadow-sm border border-emerald-200">
              <el-icon class="text-3xl text-emerald-500"><Trophy /></el-icon>
            </div>
            <h3 class="text-sm font-black text-emerald-800 tracking-tight">Tudo sob controle!</h3>
            <p class="text-[13px] font-medium text-emerald-600/80 mt-1 max-w-[220px] leading-tight">Não há nenhum chamado atrasado ou próximo do vencimento.</p>
          </div>

          <div v-for="alert in filteredAlerts" :key="alert.id" 
               class="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer group"
               :class="alert.isOverdue ? 'border-red-100 bg-red-50/50 hover:bg-red-100/50' : 'border-amber-100 bg-amber-50/50 hover:bg-amber-100/50'">
            
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                 :class="alert.isOverdue ? 'bg-red-100 text-red-600 border-red-200' : 'bg-amber-100 text-amber-600 border-amber-200'">
              <el-icon class="text-lg"><Clock /></el-icon>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <h4 class="text-sm font-bold text-slate-800 leading-tight truncate group-hover:text-blue-600 transition-colors">{{ alert.title }}</h4>
                <span class="text-[10px] font-black uppercase tracking-wider shrink-0 px-2 py-0.5 rounded"
                      :class="alert.isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'">
                  {{ alert.time }}
                </span>
              </div>
              <p class="text-xs font-medium text-slate-600 truncate">{{ alert.customer }}</p>
              <p v-if="isAdminOrManager" class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Responsável: <span class="text-slate-600">{{ alert.assignee }}</span>
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { useDashboardStore } from '../store/dashboard.store';
import VueApexCharts from 'vue3-apexcharts';
import { 
  ChatDotRound, Ticket, CircleCheck, Timer, TopRight, BottomRight, 
  DataLine, PieChart, Download, ArrowRight, Trophy, WarningFilled, Clock 
} from '@element-plus/icons-vue';

// Setup e Permissões
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const userName = computed(() => {
  if (authStore.user && authStore.user.name) {
    return authStore.user.name.split(' ')[0];
  }
  return 'Usuário';
});

const isAdminOrManager = computed(() => {
  return authStore.hasRole(['ADMIN', 'MANAGER']);
});

onMounted(() => {
  dashboardStore.fetchDashboardData();
});

// KPIs
const kpiData = computed(() => {
  const stats = dashboardStore.stats;
  if (!stats) {
    return { chatsAtivos: 0, ticketsPendentes: 0, taxaResolucao: 0, tma: 0 };
  }
  if (isAdminOrManager.value) {
    return { 
      chatsAtivos: stats.stats?.totalChats || 0, 
      ticketsPendentes: stats.stats?.openTickets || 0, 
      taxaResolucao: stats.stats?.resolvedTickets || 0, 
      tma: 0 
    };
  } else {
    return { chatsAtivos: 0, ticketsPendentes: 0, taxaResolucao: 0, tma: 0 };
  }
});

// Tickets Recentes
const allRecentTickets = computed(() => {
  const tickets = dashboardStore.stats?.recentTickets || [];
  return tickets.map((t: any) => ({
    title: t.title,
    customer: t.customer?.name || 'N/A',
    priority: t.priority?.toLowerCase() || 'medium',
    priorityLabel: t.priority?.substring(0, 3).toUpperCase() || 'MED',
    status: t.status,
    date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('pt-BR') : '',
    assignee: t.assignee?.name || 'N/A',
  }));
});

const filteredTickets = computed(() => {
  if (isAdminOrManager.value) return allRecentTickets.value;
  return allRecentTickets.value.filter((t: any) => t.assignee === authStore.user?.name);
});

const getPriorityColors = (priority: string) => {
  switch(priority) {
    case 'urgent': return 'bg-red-100 text-red-600';
    case 'high': return 'bg-orange-100 text-orange-600';
    case 'medium': return 'bg-blue-100 text-blue-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

// NOVO: Dados de Alertas de SLA (vem do backend)
const allSlaAlerts = ref<any[]>([]);

const filteredAlerts = computed(() => {
  if (isAdminOrManager.value) return allSlaAlerts.value;
  return allSlaAlerts.value.filter(a => a.assignee === authStore.user?.name);
});

// Gráficos (dados do banco ou vazio se não houver histórico)
const chartPeriod = ref('7d');

const areaChartSeries = computed(() => {
  const stats = dashboardStore.stats;
  if (!stats) {
    return [
      { name: 'Chats', data: [0, 0, 0, 0, 0, 0, 0] },
      { name: 'Tickets', data: [0, 0, 0, 0, 0, 0, 0] }
    ];
  }
  if (isAdminOrManager.value) {
    return [
      { name: 'Chats', data: [0, 0, 0, 0, 0, 0, stats.stats?.openChats || 0] },
      { name: 'Tickets', data: [0, 0, 0, 0, 0, 0, stats.stats?.openTickets || 0] }
    ];
  }
  return [
    { name: 'Meus Chats', data: [0, 0, 0, 0, 0, 0, 0] },
    { name: 'Meus Tickets', data: [0, 0, 0, 0, 0, 0, 0] }
  ];
});

const areaChartOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false } },
  colors: ['#3b82f6', '#10b981'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
  xaxis: {
    categories: ['01/04', '02/04', '03/04', '04/04', '05/04', '06/04', '07/04'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } }
  },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 600 } } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } }, padding: { top: 0, right: 0, bottom: 0, left: 10 } },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '13px', fontWeight: 700, markers: { radius: 12 } },
  tooltip: { theme: 'light', y: { formatter: (val: number) => val + ' registros' } }
});

const donutChartSeries = computed(() => {
  const stats = dashboardStore.stats;
  if (!stats) return [0, 0, 0, 0];
  const { openTickets = 0, inProgressTickets = 0, resolvedTickets = 0, totalChats = 0 } = stats.stats || {};
  if (isAdminOrManager.value) {
    return [openTickets, inProgressTickets || 0, resolvedTickets || 0, totalChats || 0];
  }
  return [0, 0, 0, 0];
});

const donutChartOptions = ref({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: ['A Fazer', 'Em Andamento', 'Bloqueado', 'Concluído'],
  colors: ['#e2e8f0', '#3b82f6', '#f59e0b', '#10b981'],
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { fontSize: '12px', fontWeight: 700, color: '#64748b' },
          value: { fontSize: '24px', fontWeight: 900, color: '#1e293b' },
          total: {
            show: true, label: 'Total', color: '#64748b', fontWeight: 800,
            formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
          }
        }
      }
    }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, colors: ['#ffffff'], width: 3 },
  legend: { position: 'bottom', fontSize: '13px', fontWeight: 700, markers: { radius: 12 } },
  tooltip: { theme: 'light', fillSeriesColor: false }
});
</script>

<style>
.custom-header-select .el-input__wrapper {
  background-color: #f8fafc !important;
  border-radius: 10px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: none !important;
}

.custom-header-select .el-input__inner {
  font-weight: 700 !important;
  color: #475569 !important;
  font-size: 12px !important;
}

.apexcharts-tooltip {
  border-radius: 12px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e2e8f0 !important;
}

.apexcharts-tooltip-title {
  background-color: #f8fafc !important;
  border-bottom: 1px solid #e2e8f0 !important;
  font-weight: 800 !important;
  font-family: inherit !important;
  padding: 8px 12px !important;
}

.apexcharts-text {
  font-family: inherit !important;
}
</style>