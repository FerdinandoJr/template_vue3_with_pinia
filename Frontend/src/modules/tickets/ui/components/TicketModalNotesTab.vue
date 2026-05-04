<template>
  <div class="h-full flex flex-col p-4 lg:p-6">
    <div class="h-full flex flex-col max-w-4xl mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-3 border-b border-slate-100 bg-amber-50/50 flex items-center gap-2">
        <el-icon class="text-amber-500 text-lg"><Notebook /></el-icon>
        <span class="text-xs font-bold text-amber-700">Área restrita. O cliente não visualiza as notas adicionadas aqui.</span>
      </div>
      <div class="flex-1 overflow-y-auto p-4 custom-scroll space-y-4 bg-slate-50/50">
        <div v-for="(note, index) in internalNotes" :key="index" class="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
          <el-avatar :size="32" class="bg-amber-500 text-white shrink-0 font-bold shadow-sm">
            {{ note.sender.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="flex flex-col items-end">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-xs font-bold text-slate-700">{{ note.sender }}</span>
              <span class="text-[10px] font-black text-slate-400">{{ note.time }}</span>
            </div>
            <div class="p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-amber-100/50 border border-amber-200 text-amber-900 rounded-tr-none font-medium">
              {{ note.text }}
            </div>
          </div>
        </div>
        <div v-if="internalNotes.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
          <el-icon class="text-5xl opacity-50"><EditPen /></el-icon>
          <p class="font-medium text-sm">Nenhuma nota interna registrada.</p>
        </div>
      </div>
      <div class="p-3 bg-white border-t border-slate-200">
        <div class="flex gap-2 items-end">
          <el-input v-model="newNoteMessage" type="textarea" :rows="2"
            placeholder="Adicionar uma nota de resolução interna..." class="custom-transparent-select"
            resize="none" @keyup.enter.prevent="handleAddNote" />
          <el-button type="warning" circle class="mb-1 !w-10 !h-10 !bg-amber-500 hover:!bg-amber-600 !border-none shadow-md"
            @click="handleAddNote" :disabled="!newNoteMessage.trim()">
            <el-icon><Position /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Notebook, EditPen, Position } from '@element-plus/icons-vue';

const props = defineProps<{
  internalNotes: any[];
}>();

const emit = defineEmits(['add-note']);
const newNoteMessage = ref('');

const handleAddNote = () => {
  if (!newNoteMessage.value.trim()) return;
  emit('add-note', newNoteMessage.value.trim());
  newNoteMessage.value = '';
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>
