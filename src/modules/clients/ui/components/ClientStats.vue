<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Base de Clientes</p>
        <h3 class="text-2xl font-bold text-slate-800 mt-1">{{ total }}</h3>
      </div>
      <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">👥</div>
    </div>
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes c/ Chamados</p>
        <h3 class="text-2xl font-bold text-blue-600 mt-1">{{ withTickets }}</h3>
      </div>
      <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">🎫</div>
    </div>
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Atenção (CSAT Baixo)</p>
        <h3 class="text-2xl font-bold text-amber-600 mt-1">{{ critical }}</h3>
      </div>
      <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">⚠️</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number;
  withTickets: number;
  critical: number;
}>();
</script>