<template>
  <div class="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-slate-100">
    <h3 class="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em] mb-10">Tempo Médio de Resposta</h3>
    <table class="w-full">
      <thead>
        <tr class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
          <th class="text-left pb-5">Status</th>
          <th class="text-right pb-5">Tempo</th>
          <th class="text-right pb-5">Tendência</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        <tr v-for="item in data" :key="item.priority" class="group transition-colors hover:bg-slate-50">
          <td class="py-5 text-[11px] font-bold text-slate-600 flex items-center gap-4">
            <span class="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors"></span> 
            {{ item.priority }}
          </td>
          <td class="py-5 text-right text-[11px] font-black text-slate-800 font-mono">{{ item.time }}</td>
          <td class="py-5 text-right">
            <span 
              class="text-[10px] font-bold px-3 py-1 rounded-full" 
              :class="item.trend === 'up' ? 'bg-red-50 text-red-600' : (item.trend === 'down' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600')"
            >
              {{ item.trend === 'up' ? '▲ ALTA' : (item.trend === 'down' ? '▼ BAIXA' : '• ESTÁVEL') }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ResponseTimeMetric } from '../../domain/entities/ReportMetrics';
defineProps<{ data: ResponseTimeMetric[] }>();
</script>