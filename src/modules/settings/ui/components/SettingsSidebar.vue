<template>
  <div class="w-72 bg-slate-50 border-r border-slate-100 p-8 flex flex-col h-full shrink-0">
    <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Configurações</h3>
    <nav class="space-y-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        @click="$emit('update:activeTab', tab.id)" 
        class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200" 
        :class="activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:bg-slate-100'"
      >
        <span>{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{ activeTab: string }>();
defineEmits(['update:activeTab']);

const tabs = [
  { id: 'perfil', label: 'Meu Perfil', icon: '👤' },
  { id: 'seguranca', label: 'Segurança', icon: '🔒' },
  { id: 'notificacoes', label: 'Notificações', icon: '🔔' },
  { id: 'sistema', label: 'Sistema', icon: '⚙️' },
  { id: 'equipe', label: 'Gerenciar Equipe', icon: '👥' }
];
</script>