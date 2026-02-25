<template>
  <div class="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
    <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-8">Volume Semanal</h3>
    
    <div class="flex-1 flex items-end justify-between gap-2 mt-auto pt-10">
      <div v-for="item in data" :key="item.day" class="flex flex-col items-center flex-1 gap-4">
        <div class="w-full max-w-[48px] bg-slate-50 rounded-t-xl relative flex justify-center items-end h-[200px]">
          <div 
            class="w-full bg-[#3b82f6] rounded-t-xl transition-all duration-1000 ease-out"
            :style="`height: ${item.value}%`"
          ></div>
        </div>
        <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">{{ item.day }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IWeeklyVolume } from '../../domain/entities/reports';
defineProps<{ data: IWeeklyVolume[] }>();
</script>