<template>
  <div 
    class="flex flex-col w-[340px] shrink-0 h-full bg-slate-100 rounded-2xl border border-slate-200"
    @dragover.prevent
    @drop="onDrop"
  >
    <div class="p-5 flex items-center justify-between">
      <h3 class="font-bold text-slate-700 text-sm">{{ column.title }}</h3>
      <span class="text-xs font-bold bg-white text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full shadow-sm">
        {{ column.tasks.length }}
      </span>
    </div>

    <div class="flex-1 px-3 pb-3 space-y-3 overflow-y-auto custom-scrollbar transition-colors"
         :class="{ 'bg-slate-200/50': isDraggingOver }"
         @dragenter="isDraggingOver = true"
         @dragleave="isDraggingOver = false"
    >
        <KanbanCard 
            v-for="task in column.tasks" 
            :key="task.id" 
            :task="task" 
            @dragstart="onDragStart($event, column.id)"
        />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { KanbanColumn } from '../../domain/entities/KanbanColumn';
import KanbanCard from './KanbanCard.vue';

const props = defineProps<{ column: KanbanColumn }>();
const emit = defineEmits(['move-task']);

const isDraggingOver = ref(false);

const onDragStart = (event: DragEvent, colId: string) => {
    if (event.dataTransfer) {
        event.dataTransfer.setData('source-col-id', colId);
    }
};

const onDrop = (event: DragEvent) => {
    isDraggingOver.value = false;
    if (event.dataTransfer) {
        const taskId = parseInt(event.dataTransfer.getData('task-id'));
        const sourceColId = event.dataTransfer.getData('source-col-id');
        
        if (taskId && sourceColId && sourceColId !== props.column.id) {
            emit('move-task', { taskId, from: sourceColId, to: props.column.id });
        }
    }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>