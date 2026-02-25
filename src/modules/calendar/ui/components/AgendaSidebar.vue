<template>
  <div class="w-[320px] shrink-0 flex flex-col gap-6">
    
    <div class="bg-white rounded-[16px] border border-slate-200 p-6 shadow-sm flex-1">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-[13px] font-black text-slate-800 uppercase tracking-widest">Próximos</h3>
        <button class="text-[12px] font-bold text-blue-600 hover:underline">Ver todos</button>
      </div>

      <div class="space-y-6 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-slate-100">
        <div v-for="evt in store.events" :key="evt.id" class="relative pl-8">
          <div class="absolute left-0 top-1 w-6 h-6 bg-white rounded-full border-[3px] border-white shadow-sm flex items-center justify-center z-10">
            <div :class="['w-2.5 h-2.5 rounded-full', evt.dotClass]"></div>
          </div>
          
          <div class="flex justify-between items-start">
            <div>
              <h4 class="text-[14px] font-extrabold text-slate-800 leading-tight mb-0.5">{{ evt.client }}</h4>
              <p class="text-[11px] font-medium text-slate-500 mb-1.5">{{ evt.title }}</p>
              <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">{{ evt.assigneeName }}</span>
            </div>
            <span class="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg">
              {{ evt.time }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-4 h-[120px]">
      <div class="flex-1 bg-[#1a56db] rounded-[16px] p-6 text-white flex flex-col justify-end shadow-lg shadow-blue-200">
        <span class="text-[40px] font-black leading-none mb-1">12</span>
        <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Agendados Hoje</span>
      </div>
      <div class="flex-1 bg-white rounded-[16px] border border-slate-200 p-6 flex flex-col justify-end shadow-sm">
        <span class="text-[40px] font-black leading-none mb-1 text-slate-800">03</span>
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendentes</span>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { useAgendaStore } from '../store/agenda.store';
const store = useAgendaStore();
</script>