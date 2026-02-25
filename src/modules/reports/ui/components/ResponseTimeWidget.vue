<template>
  <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
    <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-8">Tempo Médio de Resposta</h3>
    
    <div class="w-full">
      <div class="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 pb-4 border-b border-slate-50">
        <span class="flex-1">Status</span>
        <span class="flex-1 text-center">Tempo</span>
        <span class="flex-1 text-right">Tendência</span>
      </div>

      <div class="space-y-6">
        <div v-for="item in data" :key="item.id" class="flex justify-between items-center">
          <div class="flex-1 flex items-center gap-3">
            <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <span class="text-[12px] font-bold text-slate-600">{{ item.status }}</span>
          </div>
          
          <span class="flex-1 text-center text-[12px] font-black text-slate-800">{{ item.time }}</span>
          
          <div class="flex-1 flex justify-end">
            <span v-if="item.trend === 'ALTA'" class="text-[10px] font-black text-red-500 uppercase flex items-center gap-1">
              ▲ Alta
            </span>
            <span v-else class="text-[10px] font-black text-green-500 uppercase flex items-center gap-1">
              ▼ Baixa
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IResponseTime } from '../../domain/entities/reports';
defineProps<{ data: IResponseTime[] }>();
</script>