<template>
  <div class="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
    <div class="p-6 border-b border-slate-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-slate-800 capitalize">{{ currentMonthName }}</h3>
        <div class="flex gap-1">
          <el-button size="small" circle text @click="prevMonth">
            <el-icon>
              <ArrowLeft />
            </el-icon>
          </el-button>
          <el-button size="small" circle text @click="nextMonth">
            <el-icon>
              <ArrowRight />
            </el-icon>
          </el-button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
        <div v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button v-for="{ date, isCurrentMonth, isToday, isSelected } in calendarDays" :key="date.toISOString()"
          @click="handleDayClick(date)" :class="[
            'h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all mx-auto',
            !isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100',
            isToday && !isSelected ? 'bg-blue-50 text-blue-600 font-bold' : '',
            isSelected ? 'bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700' : ''
          ]">
          {{ date.getDate() }}
        </button>
      </div>
    </div>

    <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
      <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Agendas da Equipe</h4>
      <el-checkbox-group v-model="store.selectedUserIds" class="flex flex-col gap-3">
        <el-checkbox v-for="user in store.availableUsers" :key="user.id" :value="user.id" :label="user.id"
          class="!mr-0 !h-auto !py-2 !px-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all w-full">
          <div class="flex items-center gap-3">
            <el-avatar :size="28" :src="user.avatar" class="bg-slate-200 text-xs font-bold text-slate-600">
              {{ user.name.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="text-sm font-bold text-slate-700">{{ user.name }}</span>
          </div>
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { useCalendarStore } from '../store/calendar.store';

const emit = defineEmits(['date-change']);
const store = useCalendarStore();

const currentDate = ref(new Date());
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

watch(() => store.selectedDate, (newDate) => {
  if (newDate) {
    currentDate.value = new Date(newDate);
  }
}, { immediate: true });

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const endDate = new Date(lastDay);
  if (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  }

  const today = new Date();
  const selected = store.selectedDate ? new Date(store.selectedDate) : new Date();

  let current = new Date(startDate);
  while (current <= endDate) {
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.toDateString() === today.toDateString(),
      isSelected: current.toDateString() === selected.toDateString()
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
});

const prevMonth = () => {
  const newDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
  currentDate.value = newDate;
  emit('date-change', newDate);
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  currentDate.value = newDate;
  emit('date-change', newDate);
};

const handleDayClick = (date: Date) => {
  currentDate.value = date;
  if (store.setSelectedDate) {
    store.setSelectedDate(date);
  }
  emit('date-change', date);
};
</script>

<style scoped>
:deep(.el-checkbox__label) {
  width: 100%;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>