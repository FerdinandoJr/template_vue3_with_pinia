<template>
  <div class="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col">
    <h3 class="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-10 text-center">Status dos Tickets</h3>
    <div class="flex-1 flex flex-col items-center justify-center">
      <div class="relative w-52 h-52 mb-12">
        <div 
          class="w-full h-full rounded-full" 
          :style="{ background: conicGradientStyle }"
        ></div>
        <div class="absolute inset-0 m-auto w-[148px] h-[148px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
          <span class="text-4xl font-black text-slate-800 tracking-tighter">100%</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
        </div>
      </div>
      <div class="w-full space-y-4 px-2">
        <div v-for="status in data" :key="status.label" class="flex justify-between items-center group">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full shadow-sm" :style="{ backgroundColor: status.color }"></span>
            <span class="text-[11px] text-slate-500 font-extrabold uppercase tracking-tight">{{ status.label }}</span>
          </div>
          <span class="text-[13px] font-black text-slate-800">{{ status.percent }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TicketStatusMetric } from '../../domain/entities/ReportMetrics';

const props = defineProps<{ data: TicketStatusMetric[] }>();

const conicGradientStyle = computed(() => {
    return `conic-gradient(#3b82f6 0% 40%, #10b981 40% 85%, #f59e0b 85% 100%)`;
});
</script>