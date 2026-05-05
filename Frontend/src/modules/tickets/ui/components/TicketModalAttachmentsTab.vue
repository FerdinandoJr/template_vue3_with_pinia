<template>
  <div class="p-4 lg:p-6 animate-in fade-in duration-300">
    <div class="max-w-4xl mx-auto w-full">
      <div
        class="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors mb-6 group"
        @click="!isViewing && triggerFileUpload()" @dragover.prevent @drop.prevent="!isViewing && handleFileDrop()"
        :class="{ 'opacity-50 cursor-not-allowed': isViewing }">
        <el-icon class="text-4xl text-blue-400 mb-3 group-hover:scale-110 transition-transform">
          <UploadFilled />
        </el-icon>
        <h3 class="font-bold text-slate-700 mb-1">{{ isViewing ? 'Anexos do ticket' : 'Clique para anexar ou arraste arquivos' }}</h3>
        <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelected" :disabled="isViewing" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" v-if="attachments.length > 0">
        <div v-for="(file, idx) in attachments" :key="idx"
          class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors group">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <el-icon class="text-slate-500 text-lg">
                <Document />
              </el-icon>
            </div>
            <div class="truncate">
              <p class="text-sm font-bold text-slate-700 truncate">{{ file.name }}</p>
            </div>
          </div>
          <el-button v-if="!isViewing" type="danger" circle plain size="small"
            class="opacity-0 group-hover:opacity-100 transition-opacity" @click="$emit('remove-attachment', idx)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UploadFilled, Document, Delete } from '@element-plus/icons-vue';

const props = defineProps<{
  attachments: any[];
  isViewing?: boolean;
}>();

const emit = defineEmits(['add-files', 'remove-attachment']);
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) emit('add-files', target.files);
};

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) emit('add-files', event.dataTransfer.files);
};
</script>
