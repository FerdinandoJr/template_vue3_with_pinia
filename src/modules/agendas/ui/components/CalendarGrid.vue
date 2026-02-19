<template>
  <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
    <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
      <div
        v-for="day in weekDays"
        :key="day"
        class="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-50/30 gap-px overflow-hidden">
      <div
        v-for="(date, index) in calendarDays"
        :key="index"
        class="min-h-28 p-2 transition-all relative group bg-white border-b border-r border-slate-100 flex flex-col"
        :class="[
          isBlocked(date)
            ? 'bg-slate-50/80 cursor-default'
            : 'hover:bg-blue-50/20 cursor-pointer',
          !isSameMonth(date) ? 'opacity-30 bg-slate-50/20' : ''
        ]"
        @click="handleClick(date)"
        @contextmenu.prevent="handleRightClick(date)"
      >
        <div class="flex justify-between items-start mb-1 shrink-0 relative z-10">
          <span
            class="text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all"
            :class="isToday(date) ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600'"
          >
            {{ date.getDate() }}
          </span>
          <span v-if="isBlocked(date)" class="text-[10px] opacity-40">🔒</span>
        </div>

        <div
          v-if="!isBlocked(date)"
          class="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-0.5 pb-2 relative z-0"
        >
          <div
            v-for="apt in getAppointments(date)"
            :key="apt.id"
            class="px-2 py-1.5 rounded-lg border-l-4 transition hover:scale-[1.02] shadow-sm flex flex-col gap-0.5 bg-white border-slate-200"
            :class="getStatusColor(apt.status)"
          >
            <div class="flex justify-between items-center text-[9px] font-black uppercase opacity-80">
              <span>{{ apt.time }}</span>
              <span class="bg-white/90 px-1 rounded shadow-sm text-slate-800">
                {{ getAgentInitials(apt.agent) }}
              </span>
            </div>
            <div class="truncate font-bold text-[10px] leading-tight">
              {{ apt.title }}
            </div>
            <div class="text-[9px] opacity-70 truncate font-medium">
              {{ apt.clientName }}
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex-1 flex items-center justify-center opacity-10 pointer-events-none"
        >
          <span
            class="text-xl font-black text-slate-400 -rotate-12 select-none uppercase tracking-widest"
          >
            Fechado
          </span>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue';
import type { Appointment } from '../../domain/entities/Appointment';

const props = defineProps<{
  currentMonth?: Date;
  isBlocked: (date: Date) => boolean;
  getAppointments: (date: Date) => Appointment[];
}>();

const emit = defineEmits<{
  (e: 'date-click', date: Date): void;
  (e: 'date-contextmenu', date: Date): void;
}>();

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const currentMonth = computed<Date>(() => {
  return props.currentMonth
    ? new Date(props.currentMonth)
    : new Date();
});

const calendarDays = computed<Date[]>(() => {
  const targetDate = currentMonth.value;
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const days: Date[] = [];

  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();

  for (let i = startDayOfWeek; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  let nextMonthDay = 1;
  while (days.length < 42) {
    days.push(new Date(year, month + 1, nextMonthDay++));
  }

  return days;
});

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isSameMonth = (date: Date): boolean => {
  const current = currentMonth.value;
  return (
    date.getMonth() === current.getMonth() &&
    date.getFullYear() === current.getFullYear()
  );
};

const handleClick = (date: Date): void => {
  if (props.isBlocked(date) || !isSameMonth(date)) return;
  emit('date-click', date);
};

const handleRightClick = (date: Date): void => {
  emit('date-contextmenu', date);
};

const getAgentInitials = (name: string): string => {
  if (!name) return '??';

  const parts = name.trim().split(/\s+/);

  const first = parts[0] ?? '';
  const second = parts[1] ?? '';

  const firstInitial = first.charAt(0);
  const secondInitial = second.charAt(0);

  if (firstInitial && secondInitial) {
    return (firstInitial + secondInitial).toUpperCase();
  }

  if (firstInitial) {
    const secondChar = first.charAt(1);
    return (firstInitial + (secondChar || '')).toUpperCase();
  }

  return '??';
};


const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-400',
    pending: 'bg-amber-50 text-amber-700 border-amber-400',
    canceled: 'bg-red-50 text-red-700 border-red-400 opacity-60'
  };

  return colors[status] ?? 'bg-slate-50 text-slate-700 border-slate-300';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
