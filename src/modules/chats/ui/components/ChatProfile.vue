<template>
  <div v-if="contact" class="h-full bg-[#f8fafd] flex flex-col border-l border-slate-200 overflow-hidden">

    <div class="pt-10 pb-6 px-6 flex flex-col items-center bg-white shrink-0">
      <el-avatar :size="80" :src="contact.avatar" class="mb-4 bg-slate-200 text-slate-400 text-2xl">
        {{ contact.name?.charAt(0).toUpperCase() }}
      </el-avatar>
      <h2 class="text-lg font-bold text-slate-800 text-center leading-tight mb-1">{{ contact.name }}</h2>
      <p class="text-xs font-semibold text-slate-500 text-center">{{ contact.company || 'Empresa não informada' }}</p>
    </div>

    <div class="flex-1 overflow-y-auto w-full custom-scroll bg-slate-50/60 p-4">
      <el-collapse v-model="activeCollapses" class="enterprise-collapse border-none">

        <el-collapse-item name="contact"
          class="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/80 [&_.el-collapse-item\_\_header]:!px-5 [&_.el-collapse-item\_\_header]:h-12 [&_.el-collapse-item\_\_wrap]:border-none">
          <template #title>
            <span class="font-bold text-slate-700 text-[11px] tracking-widest uppercase flex items-center gap-2.5 ml-1">
              <el-icon size="16">
                <OfficeBuilding />
              </el-icon> Contato & Empresa
            </span>
          </template>
          <div class="p-4 flex flex-col gap-4 border-t border-slate-100">
            <div class="flex items-center gap-3 text-sm text-slate-700">
              <el-icon class="text-slate-400">
                <Message />
              </el-icon>
              <span class="truncate">{{ contact.email || 'Não informado' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-700">
              <el-icon class="text-slate-400">
                <Phone />
              </el-icon>
              <span class="truncate">{{ contact.phone }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item name="tags"
          class="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/80 [&_.el-collapse-item\_\_header]:!px-5 [&_.el-collapse-item\_\_header]:h-12 [&_.el-collapse-item\_\_wrap]:border-none">
          <template #title>
            <span class="font-bold text-slate-700 text-[11px] tracking-widest uppercase flex items-center gap-2.5 ml-1">
              <el-icon size="16">
                <CollectionTag />
              </el-icon> Etiquetas & Tags
            </span>
          </template>
          <div class="p-4 border-t border-slate-100">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Marcadores</h4>
              <el-popover placement="bottom-end" :width="260" trigger="click" v-model:visible="isTagMenuOpen">
                <template #reference>
                  <el-button size="small" circle>
                    <el-icon>
                      <Plus />
                    </el-icon>
                  </el-button>
                </template>
                <div class="p-1">
                  <div class="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                    <span class="text-xs font-bold text-slate-600">{{ isManagingTags ? 'Gerenciar' : 'Adicionar Tag'
                      }}</span>
                    <el-button link size="small" @click="isManagingTags = !isManagingTags">{{ isManagingTags ? 'Voltar'
                      :
                      'Gerenciar' }}</el-button>
                  </div>
                  <template v-if="!isManagingTags">
                    <div class="max-h-48 overflow-y-auto space-y-1">
                      <div v-for="(tag, idx) in availableTags" :key="idx" @click="addTagToContact(tag.label)"
                        class="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors">
                        <span :class="['w-3 h-3 rounded-full', tag.color.split(' ')[0]]"></span>
                        <span class="text-xs text-slate-700 font-medium">{{ tag.label }}</span>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <el-input v-model="newTagLabel" size="small" placeholder="Nome da tag" class="mb-2" />
                    <div class="flex flex-wrap gap-1 mb-3">
                      <button v-for="color in tagColors" :key="color" @click="newTagColor = color"
                        :class="['w-5 h-5 rounded-full border transition-all', color.split(' ')[0], newTagColor === color ? 'ring-2 ring-blue-500 scale-110 border-white' : 'border-slate-100']"></button>
                    </div>
                    <el-button type="primary" size="small" class="w-full" @click="saveTag"
                      :disabled="!newTagLabel">Salvar</el-button>
                  </template>
                </div>
              </el-popover>
            </div>
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="(tag, index) in contact.tags" :key="index" closable @close="removeTagFromContact(index)"
                effect="light" round class="!border-slate-200" :class="getTagColor(tag)">
                {{ tag }}
              </el-tag>
              <span v-if="!contact.tags.length" class="text-xs text-slate-400 italic">Sem tags</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item name="tickets"
          class="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/80 [&_.el-collapse-item\_\_header]:!px-5 [&_.el-collapse-item\_\_header]:h-12 [&_.el-collapse-item\_\_wrap]:border-none">
          <template #title>
            <span class="font-bold text-slate-700 text-[11px] tracking-widest uppercase flex items-center gap-2.5 ml-1">
              <el-icon size="16">
                <Ticket />
              </el-icon> Tickets Vinculados
            </span>
          </template>
          <div class="p-4 border-t border-slate-100 flex flex-col items-center justify-center min-h-[100px]">
            <el-empty description="Nenhum ticket" :image-size="40" class="!py-0" />
            <el-button size="small" type="primary" plain class="mt-2 w-full">Novo Ticket</el-button>
          </div>
        </el-collapse-item>

      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message, Phone, Plus, OfficeBuilding, CollectionTag, Ticket } from '@element-plus/icons-vue';
import type { IContact } from '../../domain/entities/chat';
import { useChatStore } from '../store/chat.store';

const props = defineProps<{ contact: IContact | null }>();
const store = useChatStore();
const activeCollapses = ref(['contact', 'tags', 'tickets']);

type TicketTag = { label: string; color: string };
const availableTags = ref<TicketTag[]>([
  { label: 'Financeiro', color: 'bg-green-100 text-green-700' },
  { label: 'Suporte', color: 'bg-blue-100 text-blue-700' },
  { label: 'B2B', color: 'bg-slate-200 text-slate-700' },
  { label: 'VIP', color: 'bg-purple-100 text-purple-700' }
]);

const tagColors = [
  'bg-slate-200 text-slate-700', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700', 'bg-green-100 text-green-700', 'bg-emerald-100 text-emerald-700',
  'bg-cyan-100 text-cyan-700', 'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700'
];

const isTagMenuOpen = ref(false);
const isManagingTags = ref(false);
const newTagLabel = ref('');
const newTagColor = ref('bg-slate-200 text-slate-700');

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
  if (label) {
    availableTags.value.push({ label, color: newTagColor.value });
    newTagLabel.value = '';
    isManagingTags.value = false;
  }
};
</script>