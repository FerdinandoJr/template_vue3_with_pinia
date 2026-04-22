<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50/50 border-b border-slate-100">
                <tr>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Empresa</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CNPJ</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data / Hora</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Atendente</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                <tr v-for="item in records" :key="item.id" class="hover:bg-slate-50/50 transition-colors group">
                    <td class="px-6 py-4 text-sm font-bold text-slate-800">{{ item.id }}</td>
                    <td class="px-6 py-4 text-sm font-bold text-slate-800">{{ item.companyName }}</td>
                    <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ item.cnpj }}</td>
                    <td class="px-6 py-4 text-sm font-bold text-slate-700">
                        {{ formatDateTime(item.dateTime) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 font-medium">{{ item.agentName }}</td>
                    <td class="px-6 py-4 text-center">
                        <span :class="getStatusBadge(item.status)">{{ getStatusLabel(item.status) }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button class="text-orange-400 hover:text-orange-600 transition-colors" title="Editar">✏️</button>
                            <button class="text-slate-400 hover:text-red-600 transition-colors" title="Excluir">🗑️</button>
                            <button class="text-green-500 hover:text-green-700 transition-colors" title="Ver detalhes">🔍</button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IServiceRecord } from '../../domain/entities/service-record';

defineProps<{ records: IServiceRecord[] }>();

const formatDateTime = (value?: string | Date): string => {
  if (!value) return "--/--/----";
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return value.toString();

  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return `${dateFormatter.format(date)} - ${timeFormatter.format(date)}`;
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { active: 'Ativo', inactive: 'Inativo', pending: 'Pendente' };
    return labels[status] || status;
};

const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded text-[11px] font-bold text-white inline-block min-w-[70px] text-center shadow-sm";
    if (status === 'active') return `${base} bg-[#4ade80]`; 
    if (status === 'inactive') return `${base} bg-[#ef4444]`; 
    return `${base} bg-[#fbbf24]`; 
};
</script>