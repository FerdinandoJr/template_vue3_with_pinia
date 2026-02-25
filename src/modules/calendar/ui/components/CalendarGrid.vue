<template>
  <div class="bg-white rounded-[16px] border border-slate-200 overflow-hidden flex flex-col shadow-sm">
    <div class="grid grid-cols-7 border-b border-slate-100">
      <div v-for="day in weekDays" :key="day" class="py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-100 gap-[1px]">
      <div 
        v-for="cell in calendarCells" 
        :key="cell.date"
        class="bg-white min-h-[120px] p-3 relative flex flex-col transition-colors hover:bg-slate-50"
      >
        <div class="flex justify-between items-start mb-2">
          <span :class="['text-sm font-black', cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-300']">
            {{ cell.dayNumber }}
          </span>
          <span v-if="isClosed(cell.date)" class="text-amber-400 text-xs">🔒</span>
        </div>

        <div v-if="isClosed(cell.date)" class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span class="text-[32px] font-black text-slate-50 opacity-50 -rotate-45 tracking-widest uppercase">
            Fechado
          </span>
        </div>

        <div class="flex flex-col gap-1 z-10">
          <div 
            v-for="evt in getEventsForDay(cell.date)" :key="evt.id"
            class="bg-white border border-slate-200 p-2 rounded-lg shadow-sm"
          >
            <div class="flex justify-between items-center mb-1">
              <span :class="['text-[11px] font-extrabold', evt.colorClass]">{{ evt.time }}</span>
              <span class="bg-slate-100 text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">{{ evt.assigneeInitials }}</span>
            </div>
            <h4 :class="['text-[11px] font-bold leading-tight truncate', evt.colorClass]">{{ evt.title }}</h4>
            <p class="text-[10px] text-slate-400 truncate mt-0.5">{{ evt.client }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAgendaStore } from '../store/agenda.store';

const store = useAgendaStore();
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const calendarCells = computed(() => {
  const cells = [];
  for (let i = 1; i <= 35; i++) {
    if (i <= 31) {
      cells.push({ dayNumber: i, date: `2026-03-${i.toString().padStart(2, '0')}`, isCurrentMonth: true });
    } else {
      cells.push({ dayNumber: i - 31, date: `2026-04-${(i - 31).toString().padStart(2, '0')}`, isCurrentMonth: false });
    }
  }
  return cells;
});

const getEventsForDay = (date: string) => store.events.filter(e => e.date === date);
const isClosed = (date: string) => store.closedDays.some(d => d.date === date);
</script>