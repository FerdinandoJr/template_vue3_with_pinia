<template>
  <div class="w-[340px] border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
    <div class="pt-6 px-6 pb-0 border-b border-slate-100">
      <h2 class="text-[18px] font-black text-slate-800 mb-4">Mensagens</h2>
      
      <div class="relative mb-5">
        <span class="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          class="w-full bg-[#f8fafd] border border-transparent focus:bg-white focus:border-blue-500 rounded-[12px] pl-10 pr-4 py-3 text-[13px] font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400" 
        />
      </div>

      <div class="flex gap-6 text-[13px] font-bold text-slate-400">
        <button 
          @click="store.setFilter(ChatFilter.ALL)" 
          :class="['pb-3 border-b-2 transition-colors', store.currentFilter === ChatFilter.ALL ? 'text-[#2563eb] border-[#2563eb]' : 'border-transparent hover:text-slate-600']"
        >Todas</button>
        <button 
          @click="store.setFilter(ChatFilter.UNREAD)" 
          :class="['pb-3 border-b-2 transition-colors', store.currentFilter === ChatFilter.UNREAD ? 'text-[#2563eb] border-[#2563eb]' : 'border-transparent hover:text-slate-600']"
        >Não lidas</button>
        <button 
          @click="store.setFilter(ChatFilter.QUEUE)" 
          :class="['pb-3 border-b-2 transition-colors', store.currentFilter === ChatFilter.QUEUE ? 'text-[#2563eb] border-[#2563eb]' : 'border-transparent hover:text-slate-600']"
        >Fila</button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar bg-white">
      <div 
        v-for="c in store.filteredContacts" :key="c.id" 
        @click="$emit('select', c)"
        :class="['p-4 flex items-center gap-3 cursor-pointer transition-colors border-l-4', selectedId === c.id ? 'bg-[#f4f9ff] border-blue-600' : 'border-transparent hover:bg-slate-50']"
      >
        <div class="relative shrink-0">
          <img :src="c.avatar" class="w-11 h-11 rounded-full object-cover" />
          <div v-if="c.status === 'online'" class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#22c55e] border-[2.5px] border-white rounded-full"></div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-0.5">
            <h4 class="font-extrabold text-slate-800 text-[13px] truncate">{{ c.name }}</h4>
            <span :class="['text-[11px] font-bold', selectedId === c.id ? 'text-[#2563eb]' : 'text-slate-400']">{{ c.lastMessageTime }}</span>
          </div>
          <p :class="['text-[12px] truncate font-medium', selectedId === c.id ? 'text-slate-700' : 'text-slate-500']">{{ c.lastMessage }}</p>
        </div>
        
        <div v-if="c.unreadCount > 0" class="w-2.5 h-2.5 bg-[#2563eb] rounded-full shrink-0 ml-1"></div>
        <div v-else-if="selectedId === c.id" class="w-1.5 h-1.5 bg-[#2563eb] rounded-full shrink-0 ml-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '../store/chat.store';
import { ChatFilter } from '../../domain/valueObjects/chat-enums';

const store = useChatStore();
defineProps<{ selectedId?: string }>();
defineEmits(['select']);
</script>