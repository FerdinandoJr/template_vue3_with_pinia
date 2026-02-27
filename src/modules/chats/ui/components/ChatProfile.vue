<template>
  <div v-if="contact" class="h-full bg-[#f8fafd] flex flex-col border-l border-slate-200 overflow-hidden">

    <div class="pt-10 pb-6 px-6 flex flex-col items-center bg-white shrink-0">
      <div
        class="w-20 h-20 rounded-full bg-slate-200 mb-4 flex items-center justify-center text-slate-400 text-3xl overflow-hidden shadow-sm border border-slate-100">
        <span v-if="!contact.avatar || contact.avatar.includes('?')">?</span>
        <img v-else :src="contact.avatar" class="w-full h-full object-cover" />
      </div>
      <h2 class="text-lg font-bold text-slate-800 text-center leading-tight mb-1">{{ contact.name }}</h2>
      <p class="text-xs font-semibold text-slate-500 text-center">{{ contact.company || 'Empresa não informada' }}</p>
    </div>

    <div class="px-6 bg-white shrink-0 border-b border-slate-100 pb-4">
      <div class="flex bg-slate-100 p-1 rounded-lg">
        <button @click="activeTab = 'perfil'"
          :class="['flex-1 py-1.5 text-xs font-bold rounded-md transition-all', activeTab === 'perfil' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
          PERFIL
        </button>
        <button @click="activeTab = 'tickets'"
          :class="['flex-1 py-1.5 text-xs font-bold rounded-md transition-all', activeTab === 'tickets' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
          TICKETS
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 pb-56">

      <template v-if="activeTab === 'perfil'">
        <div>
          <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Contato</h4>
          <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">

            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-slate-700 truncate">{{ contact.email || 'Não informado' }}</p>
              </div>
            </div>

            <div class="w-full h-px bg-slate-100"></div>

            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 text-pink-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z">
                  </path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-slate-700 truncate">{{ contact.phone }}</p>
              </div>
            </div>

          </div>
        </div>

        <div class="relative z-50">
          <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Tags</h4>

          <div class="flex flex-wrap items-center gap-2">
            <div v-for="(tagLabel, index) in contact.tags" :key="index"
              :class="['px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 shadow-sm', getTagColor(tagLabel)]">
              {{ tagLabel }}
              <button @click="removeTagFromContact(index)"
                class="hover:text-slate-900 ml-0.5 font-bold text-sm leading-none opacity-60 hover:opacity-100 transition-opacity">&times;</button>
            </div>

            <button @click.stop="toggleTagMenu"
              :class="['w-7 h-7 border border-dashed rounded flex items-center justify-center transition-colors', isTagMenuOpen ? 'bg-slate-100 border-slate-400 text-slate-700' : 'bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600']"
              title="Adicionar ou Gerenciar Tags">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <div v-if="isTagMenuOpen"
            class="absolute top-full left-0 mt-3 w-full bg-white border border-slate-200 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-xl py-3 flex flex-col origin-top animate-in fade-in slide-in-from-top-2 duration-200"
            @click.stop>

            <template v-if="!isManagingTags">
              <div
                class="px-4 pb-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 mb-2 flex justify-between items-center">
                <span>Atribuir Tag</span>
                <button @click.prevent="isManagingTags = true"
                  class="text-blue-600 hover:text-blue-800 tracking-wider">Gerenciar</button>
              </div>
              <div class="overflow-y-auto max-h-52 custom-scrollbar px-1">
                <button v-for="(tag, index) in availableTags" :key="index" @click="addTagToContact(tag.label)"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2.5 transition-colors rounded-md">
                  <span
                    :class="['w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-black/5', tag.color.split(' ')[0]]"></span>
                  <span class="font-semibold text-slate-700 truncate">{{ tag.label }}</span>
                </button>
                <div v-if="availableTags.length === 0" class="px-3 py-6 text-center text-xs font-medium text-slate-400">
                  Nenhuma tag criada.
                </div>
              </div>
            </template>

            <template v-else>
              <div
                class="px-4 pb-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 mb-2 flex justify-between items-center">
                <span>Gerenciar Tags</span>
                <button @click.prevent="resetTagManager"
                  class="text-slate-500 hover:text-slate-700 tracking-wider">Voltar</button>
              </div>

              <div class="px-4 flex flex-col gap-3 mb-2 border-b border-slate-100 pb-4 bg-slate-50/50 pt-2">
                <input v-model="newTagLabel" type="text" placeholder="Nome da etiqueta..."
                  class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />

                <div class="flex gap-2 flex-wrap mt-1 justify-center">
                  <button v-for="color in tagColors" :key="color" @click.prevent="newTagColor = color"
                    :class="['w-5 h-5 rounded-full border shadow-sm transition-all hover:scale-110', color.split(' ')[0], newTagColor === color ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-black/5']"></button>
                </div>

                <div class="flex gap-2 mt-2">
                  <button v-if="editingTagIndex !== null" @click.prevent="resetTagManager"
                    class="flex-1 font-bold text-xs py-2 rounded-lg transition-colors bg-slate-200 text-slate-600 hover:bg-slate-300">
                    Cancelar
                  </button>
                  <button @click.prevent="saveTag" :disabled="!newTagLabel.trim()"
                    :class="['flex-1 font-bold text-xs py-2 rounded-lg transition-colors shadow-sm', newTagLabel.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed']">
                    {{ editingTagIndex !== null ? 'Salvar Edição' : 'Criar Nova' }}
                  </button>
                </div>
              </div>

              <div class="overflow-y-auto max-h-40 custom-scrollbar px-2">
                <div v-for="(tag, index) in availableTags" :key="index"
                  class="flex justify-between items-center px-3 py-2 hover:bg-slate-50 group border-b border-slate-50 last:border-0 rounded-md">
                  <div class="flex items-center gap-2.5 overflow-hidden pr-2">
                    <span
                      :class="['w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-black/5', tag.color.split(' ')[0]]"></span>
                    <span class="font-semibold text-slate-700 text-sm truncate">{{ tag.label }}</span>
                  </div>
                  <div
                    class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white shadow-sm rounded-md border border-slate-200">
                    <button @click.prevent="editTag(index)"
                      class="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-slate-100 rounded-l-md transition-colors"
                      title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <div class="w-px bg-slate-200"></div>
                    <button @click.prevent="deleteTag(index)"
                      class="text-slate-400 hover:text-red-600 p-1.5 hover:bg-slate-100 rounded-r-md transition-colors"
                      title="Excluir">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </template>

          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col items-center justify-center pt-10 opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            class="text-slate-400 mb-3">
            <path
              d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z">
            </path>
            <path d="M13 5v2"></path>
            <path d="M13 17v2"></path>
            <path d="M13 11v2"></path>
          </svg>
          <p class="text-sm font-medium text-slate-500 text-center">Nenhum ticket vinculado<br>a este contato.</p>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { IContact } from '../../domain/entities/chat';
import { useChatStore } from '../store/chat.store';

const props = defineProps<{ contact: IContact | null }>();
const store = useChatStore();

const activeTab = ref<'perfil' | 'tickets'>('perfil');

// ====================================================
// GERENCIADOR DE ETIQUETAS (CRUD GLOBAL SIMULADO)
// ====================================================

type TicketTag = { label: string; color: string };

const availableTags = ref<TicketTag[]>([
  { label: 'Atendimento', color: 'bg-green-100 text-green-700' },
  { label: 'Bug / Erro', color: 'bg-red-100 text-red-700' },
  { label: 'Financeiro', color: 'bg-amber-100 text-amber-700' },
  { label: 'Dúvida', color: 'bg-blue-100 text-blue-700' },
  { label: 'B2B', color: 'bg-slate-200 text-slate-700' },
  { label: 'VIP', color: 'bg-purple-100 text-purple-700' }
]);

const tagColors = [
  'bg-slate-200 text-slate-700', 'bg-red-100 text-red-700',
  'bg-orange-100 text-orange-700', 'bg-amber-100 text-amber-700',
  'bg-green-100 text-green-700', 'bg-emerald-100 text-emerald-700',
  'bg-cyan-100 text-cyan-700', 'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700', 'bg-violet-100 text-violet-700',
  'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'
];

const isTagMenuOpen = ref(false);
const isManagingTags = ref(false);
const editingTagIndex = ref<number | null>(null);
const newTagLabel = ref('');
const newTagColor = ref('bg-slate-200 text-slate-700');

const closeMenu = () => { isTagMenuOpen.value = false; resetTagManager(); };
onMounted(() => document.addEventListener('click', closeMenu));
onUnmounted(() => document.removeEventListener('click', closeMenu));

const toggleTagMenu = () => {
  isTagMenuOpen.value = !isTagMenuOpen.value;
  if (!isTagMenuOpen.value) resetTagManager();
};

const resetTagManager = () => {
  isManagingTags.value = false;
  editingTagIndex.value = null;
  newTagLabel.value = '';
  newTagColor.value = 'bg-slate-200 text-slate-700';
};

const getTagColor = (label: string) => {
  const found = availableTags.value.find(t => t.label.toLowerCase() === label.toLowerCase());
  return found ? found.color : 'bg-slate-100 text-slate-600';
};

const addTagToContact = (label: string) => {
  if (props.contact && !props.contact.tags.includes(label)) {
    const newTags = [...props.contact.tags, label];
    store.updateContact(props.contact.id, { tags: newTags });
  }
  isTagMenuOpen.value = false;
};

const removeTagFromContact = (index: number) => {
  if (props.contact) {
    const newTags = [...props.contact.tags];
    newTags.splice(index, 1);
    store.updateContact(props.contact.id, { tags: newTags });
  }
};

const saveTag = () => {
  const label = newTagLabel.value.trim();
  if (!label) return;

  if (editingTagIndex.value !== null) {
    const oldLabel = availableTags.value[editingTagIndex.value]?.label;
    availableTags.value[editingTagIndex.value] = { label, color: newTagColor.value };

    if (oldLabel && props.contact) {
      const contactTagIndex = props.contact.tags.findIndex(t => t === oldLabel);
      if (contactTagIndex !== -1) {
        const updatedTags = [...props.contact.tags];
        updatedTags[contactTagIndex] = label;
        store.updateContact(props.contact.id, { tags: updatedTags });
      }
    }
  } else {
    const exists = availableTags.value.find(t => t.label.toLowerCase() === label.toLowerCase());
    if (!exists) {
      availableTags.value.push({ label, color: newTagColor.value });
    }
  }

  resetTagManager();
  isManagingTags.value = true;
};

const editTag = (index: number) => {
  const tag = availableTags.value[index];
  if (tag) {
    editingTagIndex.value = index;
    newTagLabel.value = tag.label;
    newTagColor.value = tag.color;
  }
};

const deleteTag = (index: number) => {
  const tagToDelete = availableTags.value[index];
  if (tagToDelete && props.contact) {
    const newTags = props.contact.tags.filter(t => t !== tagToDelete.label);
    store.updateContact(props.contact.id, { tags: newTags });
    availableTags.value.splice(index, 1);
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 20px;
}
</style>