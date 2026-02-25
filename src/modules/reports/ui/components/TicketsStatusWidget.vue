<template>
  <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col items-center h-full">
    <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-8 w-full text-center">Status dos Tickets</h3>
    
    <div class="relative w-48 h-48 mb-8 shrink-0">
      <svg viewBox="0 0 36 36" class="w-full h-full" style="transform: rotate(-90deg);">
        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f8fafc" stroke-width="4"></circle>
        
        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" stroke-width="4" 
                stroke-dasharray="15 85" stroke-dashoffset="0"></circle>
                
        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10b981" stroke-width="4" 
                stroke-dasharray="45 55" stroke-dashoffset="-15"></circle>
                
        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="4" 
                stroke-dasharray="40 60" stroke-dashoffset="-60"></circle>
      </svg>
      
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-3xl font-black text-slate-800 leading-none">100%</span>
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total</span>
      </div>
    </div>

    <div class="w-full space-y-4 px-2">
      <div v-for="item in data" :key="item.label" class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div :class="['w-3 h-3 rounded-full shrink-0', item.dotClass]"></div>
          <span class="text-[11px] font-black text-slate-500 uppercase tracking-widest truncate">{{ item.label }}</span>
        </div>
        <span class="text-[12px] font-black text-slate-800">{{ item.percentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITicketStatus } from '../../domain/entities/reports';
defineProps<{ data: ITicketStatus[] }>();
</script>