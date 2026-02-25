<template>
  <div class="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
    <button 
      v-for="option in options" 
      :key="option.value"
      type="button"
      @click="$emit('update:period', option.value)"
      :class="[
        'px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200',
        // Compara o período da store (current) com o valor do botão (option.value)
        current === option.value 
          ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50' 
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
      ]"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { DashboardPeriod } from '../../domain/valueObjects/dashboard-period.enum';

defineProps<{ 
  current: DashboardPeriod 
}>();

defineEmits<{
  (e: 'update:period', value: DashboardPeriod): void
}>();

const options = [
  { label: 'Hoje', value: DashboardPeriod.TODAY },
  { label: '7 Dias', value: DashboardPeriod.LAST_7_DAYS },
  { label: '30 Dias', value: DashboardPeriod.LAST_30_DAYS },
  { label: 'Mensal', value: DashboardPeriod.MONTHLY },
];
</script>