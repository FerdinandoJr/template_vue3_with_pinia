<template>
  <div class="w-[340px] border-r border-slate-200 bg-[#f8f9fa] flex flex-col h-full shrink-0">
    
    <div class="bg-white px-4 pt-4 border-b border-slate-200">
      
      <div class="relative mb-3">
        <span class="absolute left-3 top-2.5 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou número..." 
          class="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-[13px] text-slate-700 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400" 
        />
      </div>

      <div class="flex justify-between items-end">
        <button 
          @click="store.setFilter(ChatFilter.CHATS)" 
          :class="[
            'flex-1 flex justify-center items-center gap-2 pb-3 border-b-2 transition-all font-semibold text-[13px]',
            store.currentFilter === ChatFilter.CHATS ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          Chats
        </button>

        <button 
          @click="store.setFilter(ChatFilter.FILA)" 
          :class="[
            'flex-1 flex justify-center items-center gap-1.5 pb-3 border-b-2 transition-all font-semibold text-[13px] relative',
            store.currentFilter === ChatFilter.FILA ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M10 4v4"></path><path d="M14 4v4"></path><path d="M2 8h20"></path><path d="M12 16v-4"></path><path d="M8 12h8"></path></svg>
          Fila
          <span v-if="store.filaCount > 0" class="absolute top-[-4px] right-2 bg-slate-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {{ store.filaCount }}
          </span>
        </button>

        <button 
          @click="store.setFilter(ChatFilter.CONTATOS)" 
          :class="[
            'flex-1 flex justify-center items-center gap-2 pb-3 border-b-2 transition-all font-semibold text-[13px]',
            store.currentFilter === ChatFilter.CONTATOS ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Contatos
        </button>
      </div>
    </div>

    <div class="px-4 py-2 bg-[#f8f9fa] border-b border-slate-200 flex justify-between items-center text-[11px] font-semibold text-slate-500 shrink-0">
      <span>Ordenar chamados por:</span>
      <select 
        v-model="store.currentSort"
        class="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-transparent hover:border-blue-200 rounded px-2 py-1 outline-none cursor-pointer transition-colors font-bold appearance-none text-right pr-6 relative"
        style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%232563eb%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 6px center;"
      >
        <option :value="ChatSortOption.LONGEST_WAIT">Maior tempo de espera</option>
        <option :value="ChatSortOption.SHORTEST_WAIT">Menor tempo de espera</option>
        <option :value="ChatSortOption.NEWEST">Mais recente</option>
        <option :value="ChatSortOption.OLDEST">Mais antigo</option>
      </select>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar bg-white">
      <div 
        v-for="c in store.filteredContacts" :key="c.id" 
        @click="$emit('select', c)"
        :class="[
          'px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors border-l-[3px] border-b border-slate-100', 
          selectedId === c.id ? 'bg-[#f4f9ff] border-l-blue-600' : 'border-l-transparent hover:bg-slate-50'
        ]"
      >
        <div class="relative shrink-0 mt-1">
          <img :src="c.avatar" class="w-10 h-10 rounded-full object-cover" />
          <div class="absolute -bottom-1 -right-1 bg-[#25D366] text-white p-0.5 rounded-full border-2 border-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </div>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start mb-0.5">
            <h4 class="font-bold text-slate-800 text-[13px] truncate pr-2">{{ c.name }} <span v-if="c.company" class="text-slate-500 font-normal">- {{ c.company }}</span></h4>
            <span class="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">{{ c.lastMessageTime }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <p :class="['text-[12px] truncate', c.unreadCount > 0 ? 'font-bold text-slate-800' : 'font-normal text-slate-500']">
              <span v-if="c.unreadCount === 0" class="mr-1 text-slate-400 font-normal">✓✓</span>
              {{ c.lastMessage }}
            </p>
            <div v-if="c.unreadCount > 0" class="min-w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1 ml-2">
              {{ c.unreadCount }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '../store/chat.store';
import { ChatFilter, ChatSortOption } from '../../domain/valueObjects/chat-enums';

const store = useChatStore();
defineProps<{ selectedId?: string }>();
defineEmits(['select']);
</script>