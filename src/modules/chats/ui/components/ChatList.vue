<template>
  <div class="w-80 flex flex-col border-r border-slate-100 bg-white h-full">
    <div class="p-5 pb-2">
      <h2 class="text-xl font-bold text-slate-800 mb-4">Mensagens</h2>
      <div class="relative group">
        <span class="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
        <input type="text" placeholder="Pesquisar..." class="w-full bg-slate-50 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all">
      </div>
    </div>

    <div class="px-5 py-2 flex gap-4 text-sm font-medium border-b border-slate-50">
      <button v-for="option in filters" :key="option.value"
        @click="$emit('update:filter', option.value)" 
        class="pb-2 border-b-2 transition-colors" 
        :class="filter === option.value ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
      <div 
        v-for="chat in contacts" 
        :key="chat.id" 
        @click="$emit('select', chat.id)" 
        class="group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent" 
        :class="activeChatId === chat.id ? 'bg-blue-50 border-blue-100 shadow-sm' : 'hover:bg-slate-50'"
      >
        <div class="relative flex-shrink-0">
          <img :src="chat.photoUrl" class="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-200 border border-slate-100" alt="Avatar">
          <span v-if="chat.channel === 'whatsapp'" class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <div class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-white">📞</div>
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-0.5">
            <h3 class="font-bold text-slate-800 text-sm truncate" :class="chat.unread ? 'text-black' : ''">{{ chat.name }}</h3>
            <span class="text-[11px]" :class="chat.unread ? 'text-blue-600 font-bold' : 'text-slate-400'">{{ chat.time }}</span>
          </div>
          <p class="text-xs truncate" :class="chat.unread ? 'text-slate-800 font-medium' : 'text-slate-500'">{{ chat.lastMessage }}</p>
        </div>
        <div v-if="chat.unread > 0" class="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatContact } from '../../domain/entities/ChatContact';

defineProps<{
  contacts: ChatContact[];
  activeChatId: number | null;
  // RENOMEADO: de activeFilter para filter, para funcionar com v-model:filter
  filter: string; 
}>();

defineEmits(['select', 'update:filter']);

const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Não lidas', value: 'unread' },
    { label: 'Fila', value: 'queue' }
];
</script>