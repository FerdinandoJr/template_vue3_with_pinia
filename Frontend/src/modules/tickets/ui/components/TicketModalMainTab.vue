<template>
  <div class="h-full flex flex-col p-4 lg:p-6 animate-in fade-in duration-300">
    <div class="flex flex-col gap-4 max-w-4xl mx-auto w-full">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
        :class="{ 'ring-1 ring-red-500 border-red-500 bg-red-50': formErrors.title }">
        <label
          class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <el-icon><EditPen /></el-icon> Título Breve <span v-if="formErrors.title" class="text-red-500">* Requerido</span>
        </label>
        <el-input v-model="form.title" placeholder="Descreva em poucas palavras..." :disabled="isViewing"
          class="!text-lg font-medium enterprise-input" @input="$emit('update-error', 'title', false)" />
      </div>
      <div class="bg-white p-0 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
        :class="{ 'ring-1 ring-red-500 border-red-500': formErrors.description }">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <label
            class="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <el-icon><Document /></el-icon> Descrição Detalhada <span v-if="formErrors.description" class="text-red-500">* Requerido</span>
          </label>
        </div>
        <div class="p-2 flex-1">
          <RichTextEditor v-model="form.description" :readonly="isViewing"
            placeholder="Descreva todos os detalhes, anexe prints e organize em tópicos..."
            @update:modelValue="$emit('update-error', 'description', false)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditPen, Document } from '@element-plus/icons-vue';
import RichTextEditor from '@/components/RichTextEditor.vue';

const props = defineProps<{
  form: any;
  formErrors: any;
  isViewing?: boolean;
}>();

defineEmits(['update-error']);
</script>

<style scoped>
:deep(.enterprise-input .el-input__wrapper) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background-color: #ffffff !important;
  transition: all 0.2s;
}

:deep(.enterprise-input .el-input__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}
</style>
