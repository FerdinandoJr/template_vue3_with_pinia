<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Total</span>
        <span class="text-2xl">🎫</span>
      </div>
      <h3 class="text-3xl font-bold text-slate-800">{{ total }}</h3>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Abertos</span>
        <span class="text-2xl">📂</span>
      </div>
      <h3 class="text-3xl font-bold text-amber-600">{{ open }}</h3>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Em Andamento</span>
        <span class="text-2xl">⏳</span>
      </div>
      <h3 class="text-3xl font-bold text-blue-600">{{ inProgress }}</h3>
    </div>

    <div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-600 text-sm font-medium">Resolvidos</span>
        <span class="text-2xl">✅</span>
      </div>
      <h3 class="text-3xl font-bold text-green-600">{{ resolved }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}>();
</script>