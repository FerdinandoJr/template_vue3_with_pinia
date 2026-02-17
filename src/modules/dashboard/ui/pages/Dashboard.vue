<template>
  <!-- Stats Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Tickets -->
    <div class="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl flex-shrink-0">
        🎫
      </div>
      <div class="flex-1">
        <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ stats.totalTickets }}</h3>
        <p class="text-sm text-slate-600">Total de Tickets</p>
      </div>
    </div>

    <!-- Resolved Tickets -->
    <div class="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-3xl flex-shrink-0">
        ✅
      </div>
      <div class="flex-1">
        <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ stats.resolvedTickets }}</h3>
        <p class="text-sm text-slate-600">Tickets Resolvidos</p>
      </div>
    </div>

    <!-- Pending Tickets -->
    <div class="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl flex-shrink-0">
        ⏳
      </div>
      <div class="flex-1">
        <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ stats.pendingTickets }}</h3>
        <p class="text-sm text-slate-600">Tickets Pendentes</p>
      </div>
    </div>

    <!-- Active Customers -->
    <div class="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-3xl flex-shrink-0">
        👥
      </div>
      <div class="flex-1">
        <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ stats.activeCustomers }}</h3>
        <p class="text-sm text-slate-600">Clientes Ativos</p>
      </div>
    </div>
  </div>

  <!-- Charts Section -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="bg-white rounded-2xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Atividade Recente</h3>
      <div class="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600">
        <p>📊 Gráfico de atividades será exibido aqui</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-800 mb-4">Status dos Tickets</h3>
      <div class="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-slate-600">
        <p>📈 Gráfico de status será exibido aqui</p>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="bg-white rounded-2xl p-6 shadow-sm">
    <h3 class="text-lg font-semibold text-slate-800 mb-4">Atividades Recentes</h3>
    <div class="space-y-4">
      <div 
        v-for="activity in recentActivities" 
        :key="activity.id" 
        class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl transition-all duration-200 hover:bg-slate-100 hover:translate-x-1"
      >
        <div class="w-10 h-10 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {{ activity.icon }}
        </div>
        <div class="flex-1 flex flex-col gap-1">
          <p class="text-slate-800 text-[15px]">{{ activity.text }}</p>
          <span class="text-slate-500 text-xs">{{ activity.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const stats = reactive({
  totalTickets: 247,
  resolvedTickets: 189,
  pendingTickets: 58,
  activeCustomers: 142
})

const recentActivities = reactive([
  { id: 1, icon: '🎫', text: 'Novo ticket criado: Problema com login', time: 'há 5 minutos' },
  { id: 2, icon: '✅', text: 'Ticket #1234 foi resolvido', time: 'há 15 minutos' },
  { id: 3, icon: '👤', text: 'Novo cliente cadastrado: João Silva', time: 'há 1 hora' },
  { id: 4, icon: '📝', text: 'Ticket #1235 atualizado', time: 'há 2 horas' },
  { id: 5, icon: '🔔', text: 'Lembrete: Revisar tickets pendentes', time: 'há 3 horas' }
])
</script>
