<template>
  <div class="w-full md:w-[340px] border-r border-slate-200 bg-[#f8f9fa] flex flex-col h-full shrink-0">
    <div class="p-4 bg-white border-b border-slate-200 shrink-0">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-black tracking-tight text-slate-800">Mensagens</h2>
      </div>

      <div class="relative w-full mb-4">
        <el-input v-model="localSearch" @input="handleSearch" placeholder="Pesquisar chats..." clearable
          class="w-full search-input">
          <template #prefix>
            <el-icon class="text-slate-400">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="flex bg-slate-100 p-1 rounded-xl">
        <button v-for="filter in Object.values(ChatFilter)" :key="filter" @click="store.setFilter(filter)" :class="[
          'flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-lg transition-all',
          store.currentFilter === filter ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        ]">
          {{ filter === ChatFilter.CHATS ? 'Chats' : (filter === ChatFilter.FILA ? 'Fila' : 'Contatos') }}
          <span v-if="filter === ChatFilter.FILA && store.filaCount > 0"
            class="ml-1 inline-flex items-center justify-center bg-red-500 text-white text-[9px] rounded-full w-4 h-4">
            {{ store.filaCount }}
          </span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar bg-white">
      <div v-for="contact in store.filteredContacts" :key="contact.id" @click="$emit('select', contact)" :class="[
        'flex gap-3 p-4 cursor-pointer transition-colors border-b border-slate-50 hover:bg-slate-50',
        selectedId === contact.id ? 'bg-blue-50/50' : ''
      ]">
        <div class="relative shrink-0">
          <el-avatar :size="48" :src="contact.avatar"
            class="bg-slate-200 text-slate-400 font-bold text-lg border border-slate-100 shadow-sm">
            {{ contact.name.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <span v-if="contact.channel === ChatChannel.WHATSAPP"
              class="w-4 h-4 bg-[#25D366] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="white">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start mb-0.5">
            <h4 class="text-sm font-bold text-slate-800 truncate"
              :class="{ 'text-blue-600': selectedId === contact.id }">
              {{ contact.name }}
            </h4>
            <span class="text-[10px] font-bold text-slate-400 shrink-0">{{ contact.lastMessageTime }}</span>
          </div>
          <p class="text-[12px] text-slate-500 truncate mb-1 pr-4"
            :class="{ 'font-semibold text-slate-700': contact.unreadCount > 0 }">
            {{ contact.lastMessage }}
          </p>
          <div class="flex justify-between items-center">
            <div class="flex gap-1 overflow-hidden">
              <span v-for="tag in contact.tags" :key="tag"
                class="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                {{ tag }}
              </span>
            </div>
            <div v-if="contact.unreadCount > 0"
              class="bg-blue-500 text-white text-[10px] font-bold px-1.5 min-w-[20px] h-5 rounded-full flex items-center justify-center shadow-sm">
              {{ contact.unreadCount }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="store.filteredContacts.length === 0" class="p-8 text-center text-slate-400">
        <el-icon :size="40" class="mb-2 opacity-50">
          <ChatDotRound />
        </el-icon>
        <p class="text-sm font-medium">Nenhum contato encontrado.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '../store/chat.store';
import { Search, ChatDotRound } from '@element-plus/icons-vue';
import { ChatFilter, ChatChannel } from '../../domain/valueObjects/chat-enums';

defineProps<{ selectedId?: string }>();
defineEmits(['select']);

const store = useChatStore();
const localSearch = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const handleSearch = (value: string) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.setSearchQuery(value);
  }, 300);
};
</script>
<style scoped>
:deep(.search-input .el-input__wrapper) {
  border-radius: 12px;
  background-color: #f1f5f9;
  box-shadow: none !important;
  border: 1px solid transparent;
  transition: all 0.2s;
}

:deep(.search-input .el-input__wrapper.is-focus) {
  background-color: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px #eff6ff !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>