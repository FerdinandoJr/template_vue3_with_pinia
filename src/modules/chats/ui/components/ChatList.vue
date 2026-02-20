<template>
  <div class="w-80 flex flex-col bg-white border-r border-slate-100 h-full shrink-0">
    
    <div class="p-5 border-b border-slate-50">
      <h2 class="text-xl font-bold text-slate-800 mb-4">Mensagens</h2>
      <div class="relative">
        <span class="absolute left-3 top-2.5 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
      </div>
    </div>

    <div class="px-5 py-2 flex gap-4 text-sm font-medium border-b border-slate-100 shrink-0">
      <button 
        v-for="option in filters" 
        :key="option.value"
        @click="filter = option.value" 
        class="pb-2 border-b-2 transition-colors relative" 
        :class="filter === option.value ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'"
      >
        {{ option.label }}
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div 
        v-for="contact in contacts" 
        :key="contact.id"
        @click="$emit('select', contact.id)"
        class="p-4 border-b border-slate-50 cursor-pointer transition-colors relative group"
        :class="activeChatId === contact.id ? 'bg-blue-50' : 'hover:bg-slate-50'"
      >
        <div v-if="activeChatId === contact.id" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md"></div>

        <div class="flex items-center gap-3 pl-1">
          <div class="relative shrink-0">
            <img :src="contact.photoUrl" :alt="contact.name" class="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm">
            <span 
              class="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full"
              :class="contact.status === 'open' ? 'bg-green-500' : 'bg-amber-400'"
            ></span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline mb-0.5">
              <h3 class="font-bold text-sm text-slate-800 truncate" :class="{ 'text-blue-900': activeChatId === contact.id }">
                {{ contact.name }}
              </h3>
              <span class="text-[10px] font-medium ml-2 shrink-0" :class="contact.unread > 0 ? 'text-blue-600 font-bold' : 'text-slate-400'">
                {{ contact.time }}
              </span>
            </div>
            
            <div class="flex justify-between items-center">
              <p class="text-xs truncate pr-2" :class="contact.unread > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'">
                {{ contact.lastMessage }}
              </p>
              <span v-if="contact.unread > 0" class="shrink-0 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {{ contact.unread }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="contacts.length === 0" class="p-8 text-center text-sm text-slate-400">
        Nenhuma conversa encontrada.
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { ChatContact } from '../../domain/entities/ChatContact';

defineProps<{
  contacts: ChatContact[];
  activeChatId: number | null;
}>();

defineEmits(['select']);

const filter = defineModel<string>('filter', { default: 'all' });

const filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Não lidas', value: 'unread' },
    { label: 'Fila', value: 'queue' }
];
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>