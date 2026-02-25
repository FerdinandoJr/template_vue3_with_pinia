<template>
  <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex h-full items-center gap-6">
    
    <div class="w-40 h-40 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 40 40" class="w-full h-full" style="transform: rotate(-90deg);">
        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f8fafc" stroke-width="6"></circle>
        
        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#8b5cf6" stroke-width="6" 
                stroke-dasharray="30 70" stroke-dashoffset="0"></circle>
        
        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#3b82f6" stroke-width="6" 
                stroke-dasharray="70 30" stroke-dashoffset="-30"></circle>
      </svg>
    </div>

    <div class="flex-1 flex flex-col justify-center space-y-6">
      <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-800">Performance Equipe</h3>
      
      <div class="space-y-4">
        <div v-for="item in data" :key="item.name" class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div :class="['w-3 h-3 rounded-full shrink-0', item.dotClass]"></div>
            <span class="text-[11px] font-black text-slate-500 uppercase tracking-widest truncate">{{ item.name }}</span>
          </div>
          <span class="text-[12px] font-black text-slate-800">{{ item.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITeamPerformance } from '../../domain/entities/reports';
defineProps<{ data: ITeamPerformance[] }>();
</script>