<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div class="flex justify-between items-start mb-4">
      <div class="p-3 rounded-xl" :class="bgClass">
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <span 
        class="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1" 
        :class="trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
      >
        {{ trend > 0 ? '↑' : '↓' }} {{ Math.abs(trend) }}%
      </span>
    </div>
    <div>
      <h3 class="text-3xl font-bold text-slate-800 mb-1">{{ value }}</h3>
      <p class="text-sm font-medium text-slate-500">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  icon: string;
  bgClass: string;
  trend: number;
}>();
</script>