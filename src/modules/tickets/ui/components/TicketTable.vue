<template>
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
          <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{{ ticket.id }}</td>
            <td class="px-6 py-4 text-sm text-slate-900">{{ ticket.title }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ ticket.customer }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(ticket.status)">{{ getStatusLabel(ticket.status) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getPriorityClass(ticket.priority)">{{ getPriorityLabel(ticket.priority) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{{ formatDate(ticket.createdAt) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button @click="$emit('view', ticket.id)" class="text-blue-600 hover:text-blue-800 font-medium mr-3">Ver</button>
              <button @click="$emit('edit', ticket.id)" class="text-slate-600 hover:text-slate-800 font-medium">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket } from '../../domain/entities/Ticket';

defineProps<{
  tickets: Ticket[];
}>();

defineEmits(['view', 'edit']);

// Helpers de UI
const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR');

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'open': 'px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800',
    'in-progress': 'px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    'resolved': 'px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'
  };
  return map[status] || '';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { 'open': 'Aberto', 'in-progress': 'Em Andamento', 'resolved': 'Resolvido' };
  return map[status] || status;
};

const getPriorityClass = (priority: string) => {
  const map: Record<string, string> = {
    'low': 'px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700',
    'medium': 'px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700',
    'high': 'px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700',
    'urgent': 'px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700'
  };
  return map[priority] || '';
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta', 'urgent': 'Urgente' };
  return map[priority] || priority;
};
</script>