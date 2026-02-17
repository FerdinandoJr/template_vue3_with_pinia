<template>
  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <!-- Total -->
    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Total</span>
        <span class="text-2xl">🎫</span>
      </div>
      <h3 class="text-3xl font-bold text-slate-800">{{ totalTickets }}</h3>
    </div>

    <!-- Abertos -->
    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Abertos</span>
        <span class="text-2xl">📝</span>
      </div>
      <h3 class="text-3xl font-bold text-amber-600">{{ openTickets }}</h3>
    </div>

    <!-- Em Andamento -->
    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Em Andamento</span>
        <span class="text-2xl">⏳</span>
      </div>
      <h3 class="text-3xl font-bold text-blue-600">{{ inProgressTickets }}</h3>
    </div>

    <!-- Resolvidos -->
    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Resolvidos</span>
        <span class="text-2xl">✅</span>
      </div>
      <h3 class="text-3xl font-bold text-green-600">{{ resolvedTickets }}</h3>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
    <div class="flex items-center gap-4">
      <span class="text-slate-700 font-medium">Filtrar:</span>
      <button
        v-for="filterOption in filterOptions"
        :key="filterOption.value"
        @click="setFilter(filterOption.value)"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-all',
          filter === filterOption.value
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        ]"
      >
        {{ filterOption.label }}
      </button>
    </div>
  </div>

  <!-- Tickets Table -->
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Título</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Prioridade</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Criado em</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr 
            v-for="ticket in filteredTickets" 
            :key="ticket.id"
            class="hover:bg-slate-50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{{ ticket.id }}</td>
            <td class="px-6 py-4 text-sm text-slate-900">{{ ticket.title }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ ticket.customer }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(ticket.status)">
                {{ getStatusLabel(ticket.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getPriorityClass(ticket.priority)">
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ formatDate(ticket.created) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button class="text-blue-600 hover:text-blue-800 font-medium mr-3">Ver</button>
              <button class="text-slate-600 hover:text-slate-800 font-medium">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTicketsStore } from '../stores/tickets.store'

const ticketsStore = useTicketsStore()
const { filteredTickets, totalTickets, openTickets, inProgressTickets, resolvedTickets, filter } = storeToRefs(ticketsStore)
const { loadTickets, setFilter } = ticketsStore

const filterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Abertos', value: 'open' },
  { label: 'Em Andamento', value: 'in-progress' },
  { label: 'Resolvidos', value: 'resolved' }
]

const getStatusClass = (status: string) => {
  const classes = {
    'open': 'px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800',
    'in-progress': 'px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    'resolved': 'px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'
  }
  return classes[status as keyof typeof classes] || ''
}

const getStatusLabel = (status: string) => {
  const labels = {
    'open': 'Aberto',
    'in-progress': 'Em Andamento',
    'resolved': 'Resolvido'
  }
  return labels[status as keyof typeof labels] || status
}

const getPriorityClass = (priority: string) => {
  const classes = {
    'low': 'px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700',
    'medium': 'px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700',
    'high': 'px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700',
    'urgent': 'px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700'
  }
  return classes[priority as keyof typeof classes] || ''
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'urgent': 'Urgente'
  }
  return labels[priority as keyof typeof labels] || priority
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(() => {
  loadTickets()
})
</script>
