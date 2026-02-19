<template>
  <div class="w-full lg:w-80 flex flex-col gap-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-black text-slate-800 text-[10px] uppercase tracking-wider">Próximos</h3>
        <button class="text-[10px] font-bold text-blue-600 hover:underline">Ver todos</button>
      </div>
      <div class="space-y-6 relative">
        <div class="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>
        <div v-for="item in appointments" :key="item.id" class="relative pl-10 group cursor-pointer">
          <div class="absolute left-0 top-1.5 w-7 h-7 rounded-full border-4 bg-white flex items-center justify-center z-10" :class="getBorderColor(item.status)">
            <div class="w-1.5 h-1.5 rounded-full" :class="getDotColor(item.status)"></div>
          </div>
          <div class="flex justify-between items-start">
            <span class="text-xs font-black text-slate-800 group-hover:text-blue-600 transition">{{ item.clientName }}</span>
            <span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{{ item.time }}</span>
          </div>
          <p class="text-[10px] text-slate-500 font-medium mt-0.5 truncate">{{ item.title }}</p>
          <div class="text-[8px] font-black text-slate-300 mt-1 uppercase tracking-tighter">{{ item.agent }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-blue-600 p-5 rounded-2xl shadow-lg shadow-blue-200 flex flex-col justify-between h-28 cursor-default">
        <div class="text-3xl font-black text-white">{{ countToday }}</div>
        <div class="text-[9px] text-blue-100 font-black uppercase tracking-widest">Agendados Hoje</div>
      </div>
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28 cursor-default">
        <div class="text-3xl font-black text-slate-800">{{ countPending }}</div>
        <div class="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pendentes</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Appointment } from '../../domain/entities/Appointment';

defineProps<{
  appointments: Appointment[];
  countToday: number;
  countPending: number;
}>();

const getBorderColor = (status: string) => {
  const colors: Record<string, string> = { 'confirmed': 'border-emerald-100', 'pending': 'border-amber-100', 'canceled': 'border-red-100' };
  return colors[status] || 'border-slate-100';
};

const getDotColor = (status: string) => {
  const colors: Record<string, string> = { 'confirmed': 'bg-emerald-500', 'pending': 'bg-amber-500', 'canceled': 'bg-red-500' };
  return colors[status] || 'bg-slate-400';
};
</script>