<template>
  <div class="w-[340px] border-r border-slate-200 bg-[#f8f9fa] flex flex-col h-full shrink-0">
    <div class="bg-white px-4 pt-4 border-b border-slate-200">
      <div class="mb-3">
        <el-input v-model="searchQuery" placeholder="Pesquisar por nome ou número..." clearable>
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <el-tabs v-model="activeFilter" @tab-change="handleTabChange" class="demo-tabs" stretch>
        <el-tab-pane :name="ChatFilter.CHATS" label="Chats" />
        <el-tab-pane :name="ChatFilter.FILA">
          <template #label>
            <span class="flex items-center gap-2">
              Fila
              <el-badge v-if="store.filaCount > 0" :value="store.filaCount" type="danger" class="ml-1 scale-90" />
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane :name="ChatFilter.CONTATOS" label="Contatos" />
      </el-tabs>
    </div>

    <div
      class="px-4 py-2 bg-[#f8f9fa] border-b border-slate-200 flex justify-between items-center text-[11px] font-semibold text-slate-500 shrink-0">
      <span>Ordenar por:</span>
      <el-select v-model="store.currentSort" size="small" class="w-36" :teleported="false">
        <el-option :value="ChatSortOption.LONGEST_WAIT" label="Maior espera" />
        <el-option :value="ChatSortOption.SHORTEST_WAIT" label="Menor espera" />
        <el-option :value="ChatSortOption.NEWEST" label="Mais recente" />
        <el-option :value="ChatSortOption.OLDEST" label="Mais antigo" />
      </el-select>
    </div>

    <el-scrollbar class="flex-1 bg-white">
      <div v-for="c in store.filteredContacts" :key="c.id" @click="$emit('select', c)" :class="[
        'px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors border-l-[3px] border-b border-slate-100',
        selectedId === c.id ? 'bg-[#f4f9ff] border-l-blue-600' : 'border-l-transparent hover:bg-slate-50'
      ]">
        <div class="relative shrink-0 mt-1">
          <el-avatar :size="40" :src="c.avatar" shape="circle"
            class="border border-slate-200 bg-slate-100 text-slate-400">
            {{ c.name?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div
            class="absolute -bottom-1 -right-1 bg-[#25D366] text-white p-0.5 rounded-full border-2 border-white flex items-center justify-center">
            <el-icon :size="10">
              <BrandWhatsapp />
            </el-icon>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-baseline mb-0.5">
            <h4
              :class="['text-[13px] truncate mr-2', c.unreadCount > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-700']">
              {{ c.name }} <span v-if="c.company" class="font-normal text-slate-500 text-xs">- {{ c.company }}</span>
            </h4>
            <span :class="['text-[10px] font-bold shrink-0', c.unreadCount > 0 ? 'text-green-600' : 'text-slate-400']">
              {{ c.lastMessageTime }}
            </span>
          </div>

          <div class="flex justify-between items-center">
            <p
              :class="['text-xs truncate max-w-[190px]', c.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500']">
              <span v-if="!c.unreadCount && c.lastMessage && c.status !== 'queued'"
                class="text-blue-500 mr-1 text-[10px]">✓✓</span>
              {{ c.lastMessage || 'Iniciar conversa' }}
            </p>
            <el-badge v-if="c.unreadCount > 0" :value="c.unreadCount" type="danger" class="scale-90" />
          </div>

          <div v-if="c.tags && c.tags.length > 0" class="flex gap-1 mt-1.5 flex-wrap">
            <span v-for="tag in c.tags.slice(0, 2)" :key="tag"
              class="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-bold border border-slate-200">
              {{ tag }}
            </span>
            <span v-if="c.tags.length > 2" class="text-[9px] text-slate-400">+{{ c.tags.length - 2 }}</span>
          </div>
        </div>
      </div>

      <div v-if="store.filteredContacts.length === 0"
        class="flex flex-col items-center justify-center py-10 text-slate-400">
        <el-icon :size="40" class="mb-2">
          <ChatDotRound />
        </el-icon>
        <p class="text-xs font-bold">Nenhum contato encontrado</p>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useChatStore } from '../store/chat.store';
import { ChatFilter, ChatSortOption } from '../../domain/valueObjects/chat-enums';
import { Search, ChatDotRound } from '@element-plus/icons-vue';

// Icone WhatsApp
const BrandWhatsapp = {
  render() {
    return { template: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.505.485.017.813.043 1.169.043h.032c.69 0 1.386-.176 2.03-.527l-2.03-.967Z"/></svg>` }
  }
}

defineProps<{ selectedId?: string }>();
const store = useChatStore();

const searchQuery = ref('');
const activeFilter = ref(ChatFilter.CHATS);

const handleTabChange = (name: string | number) => {
  store.setFilter(name as ChatFilter);
};

watch(() => store.currentFilter, (newVal) => activeFilter.value = newVal);
watch(searchQuery, (val) => store.setSearchQuery(val));
</script>

<style scoped>
:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e2e8f0;
}

:deep(.el-tabs__item) {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

:deep(.el-tabs__item.is-active) {
  color: #2563eb;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}
</style>