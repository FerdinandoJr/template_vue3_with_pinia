<template>
  <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col min-h-[450px]">
    <h3 class="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-12">Volume Semanal</h3>
    <div class="flex-1 flex flex-col">
      <div class="flex-1 flex items-end justify-around px-4 border-b border-slate-100 pb-2">
        <div v-for="(item, index) in data" :key="index" class="flex-1 flex flex-col items-center group h-full justify-end">
          <div 
            class="w-14 bg-[#3b82f6] rounded-t-xl transition-all duration-500 hover:brightness-110 cursor-pointer relative" 
            :style="{ height: item.value + '%' }"
          >
            <div class="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-20 transition-opacity">
              {{ item.value }} atendimentos
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-around px-4 mt-6">
        <span v-for="item in data" :key="item.day" class="flex-1 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
          {{ item.day }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeeklyData } from '../../domain/entities/ReportMetrics';
defineProps<{ data: WeeklyData[] }>();
</script>