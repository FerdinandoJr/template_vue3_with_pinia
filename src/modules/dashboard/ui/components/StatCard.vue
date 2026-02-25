<template>
  <div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
    <div :class="[color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg']">
      {{ icon }}
    </div>
    <div>
      <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">{{ title }}</p>
      <p class="text-2xl font-black text-slate-800">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; value: string | number; icon: string; color: string }>();
</script>