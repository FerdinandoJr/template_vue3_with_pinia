<template>
  <div class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
    <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 bg-white items-center">
      <div class="relative flex-1 w-full">
        <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
        <input 
          :value="searchQuery" 
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text" 
          placeholder="Buscar por nome, empresa ou tag..." 
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 transition outline-none"
        >
      </div>
      <div class="flex gap-2">
         <button class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50 font-medium">Filtros</button>
         <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition">+ Novo Cliente</button>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <tr>
            <th class="px-6 py-3">Cliente</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3">Chamados</th>
            <th class="px-6 py-3">Satisfação</th>
            <th class="px-6 py-3 text-right">Última Interação</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="client in clients" :key="client.id" @click="$emit('select', client.id)" class="group hover:bg-slate-50 transition-colors cursor-pointer">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">{{ client.avatar }}</div>
                <div>
                  <div class="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition">{{ client.name }}</div>
                  <div class="text-xs text-slate-500">{{ client.company }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1 items-start">
                <span :class="getStatusBadge(client.status)">{{ client.status }}</span>
                <div class="flex gap-1 mt-1">
                  <span v-for="tag in client.tags" :key="tag" class="text-[10px] px-1.5 rounded border border-slate-200 text-slate-500">{{ tag }}</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div v-if="client.openTickets > 0" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-100">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span class="text-xs font-bold">{{ client.openTickets }} Abertos</span>
              </div>
              <span v-else class="text-xs text-slate-400 font-medium flex items-center gap-1"><span class="text-green-500">✓</span> Tudo certo</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-1 text-sm">
                <span class="font-bold" :class="client.csat >= 4 ? 'text-green-600' : 'text-amber-600'">{{ client.csat }}</span>
                <span class="text-slate-300">/ 5.0</span>
              </div>
              <div class="w-20 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div class="h-full rounded-full" :class="client.csat >= 4 ? 'bg-green-500' : 'bg-amber-500'" :style="{ width: (client.csat * 20) + '%' }"></div>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <span class="text-sm font-medium text-slate-700">{{ client.lastInteraction }}</span>
              <div class="text-[10px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">via <span class="capitalize">{{ client.source }}</span></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Client } from '../../domain/entities/Client';

defineProps<{
  clients: Client[];
  searchQuery: string;
}>();

defineEmits(['select', 'update:searchQuery']);

const getStatusBadge = (status: string) => { 
  const styles: Record<string, string> = { 
    active: 'text-green-600 bg-green-50 border-green-100', 
    blocked: 'text-red-600 bg-red-50 border-red-100', 
    onboarding: 'text-blue-600 bg-blue-50 border-blue-100' 
  }; 
  return `px-2 py-0.5 rounded text-xs font-bold border ${styles[status] || 'text-slate-500'}`; 
};
</script>