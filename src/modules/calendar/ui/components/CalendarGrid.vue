<template>
  <div
    class="bg-white rounded-[16px] border border-slate-200 overflow-hidden flex flex-col shadow-sm select-none h-full">
    <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
      <div v-for="day in weekDays" :key="day"
        class="py-3 text-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-200 gap-[1px]">
      <div v-for="cell in calendarCells" :key="cell.date" @click="handleCellClick(cell.date)" :class="[
        'bg-white min-h-[100px] p-2 relative flex flex-col transition-colors cursor-pointer',
        cell.isCurrentMonth ? 'hover:bg-blue-50/30' : 'bg-slate-50/50 text-opacity-50'
      ]">
        <div class="flex justify-between items-start mb-2">
          <span :class="[
            'text-sm font-black w-7 h-7 flex items-center justify-center rounded-full',
            cell.isToday ? 'bg-indigo-600 text-white' : (cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-300')
          ]">
            {{ cell.dayNumber }}
          </span>
          <el-tooltip v-if="isClosed(cell.date)" content="Dia não útil" placement="top">
            <span class="text-amber-400 text-xs">🔒</span>
          </el-tooltip>
        </div>

        <div v-if="isClosed(cell.date)"
          class="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span class="text-[20px] font-black text-slate-100 -rotate-45 tracking-widest uppercase select-none">
            Fechado
          </span>
        </div>

        <div class="flex flex-col gap-1 z-10 overflow-y-auto custom-scrollbar max-h-[100px]">
          <div v-for="evt in getEventsForDay(cell.date)" :key="evt.id" @click.stop="$emit('edit-event', evt)"
            class="bg-white border-l-4 p-1.5 rounded shadow-sm hover:shadow-md transition-all hover:translate-y-[-1px] group"
            :class="evt.colorClass ? evt.colorClass.replace('text-', 'border-') : 'border-slate-400'">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-slate-500">{{ evt.time }}</span>
            </div>
            <p class="text-[11px] font-bold text-slate-800 truncate leading-tight">{{ evt.client }}</p>
            <p class="text-[9px] text-slate-400 truncate">{{ evt.title }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAgendaStore } from '../store/agenda.store';
import type { IAgendaEvent } from '../../domain/entities/agenda';

interface ICalendarCell {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const emit = defineEmits(['create-event', 'edit-event']);
const store = useAgendaStore();
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const calendarCells = computed<ICalendarCell[]>(() => {
  const year = store.selectedDate.getFullYear();
  const month = store.selectedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const endDate = new Date(lastDayOfMonth);
  if (endDate.getDay() < 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  }

  const cells: ICalendarCell[] = [];
  const currentDate = new Date(startDate);
  const todayStr = new Date().toISOString().split('T')[0];

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0] || '';

    cells.push({
      date: dateStr,
      dayNumber: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: dateStr === todayStr
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return cells;
});

const getEventsForDay = (date: string) => {
  return store.filteredEvents
    .filter((e) => e.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
};

const isClosed = (date: string) => store.closedDays.some(d => d.date === date);

const handleCellClick = (date: string) => {
  emit('create-event', date);
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 0px;
}
</style>