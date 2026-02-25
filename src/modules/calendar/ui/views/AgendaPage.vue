<template>
  <div class="flex flex-col h-[calc(100vh-4rem)] p-6 bg-[#f8fafd] overflow-hidden">
    
    <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-[16px] border border-slate-200 shadow-sm shrink-0">
      
      <div class="flex items-center gap-6">
        <div class="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
          <button class="w-8 h-8 flex items-center justify-center text-blue-600 bg-white rounded shadow-sm font-bold text-sm hover:bg-slate-50">◀</button>
          <span class="px-4 text-[13px] font-black text-slate-700">Hoje</span>
          <button class="w-8 h-8 flex items-center justify-center text-blue-600 bg-white rounded shadow-sm font-bold text-sm hover:bg-slate-50">▶</button>
        </div>
        <h2 class="text-xl font-black text-slate-800">Março 2026</h2>
      </div>

      <div class="flex items-center gap-4">
        <button class="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-[12px] font-bold rounded-lg hover:bg-slate-50">
          Sincronizar Google
        </button>
        
        <div class="flex bg-slate-50 rounded-lg p-1 border border-slate-100 text-[12px] font-bold text-slate-500">
          <button class="px-4 py-1.5 bg-white text-slate-800 rounded shadow-sm">Mês</button>
          <button class="px-4 py-1.5 hover:text-slate-800 transition-colors">Semana</button>
          <button class="px-4 py-1.5 hover:text-slate-800 transition-colors">Dia</button>
        </div>

        <button class="bg-[#1a56db] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold shadow-md shadow-blue-200 hover:bg-blue-700 flex items-center gap-2">
          <span>+</span> Novo Agendamento
        </button>
      </div>

    </div>

    <div class="flex gap-6 flex-1 min-h-0">
      <CalendarGrid class="flex-1" />
      <AgendaSidebar />
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAgendaStore } from '../store/agenda.store';
import CalendarGrid from '../components/CalendarGrid.vue';
import AgendaSidebar from '../components/AgendaSidebar.vue';

const store = useAgendaStore();

onMounted(() => {
  store.fetchAgendaData();
});
</script>