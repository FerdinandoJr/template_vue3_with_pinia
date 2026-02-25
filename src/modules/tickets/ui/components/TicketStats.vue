<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <p class="text-sm font-medium text-slate-500">Total de Tickets</p>
      <p class="text-2xl font-bold text-slate-800">{{ total }}</p>
    </div>
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-amber-100">
      <p class="text-sm font-medium text-amber-600">Abertos</p>
      <p class="text-2xl font-bold text-amber-700">{{ open }}</p>
    </div>
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
      <p class="text-sm font-medium text-blue-600">Em Andamento</p>
      <p class="text-2xl font-bold text-blue-700">{{ inProgress }}</p>
    </div>
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-green-100">
      <p class="text-sm font-medium text-green-600">Resolvidos</p>
      <p class="text-2xl font-bold text-green-700">{{ resolved }}</p>
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