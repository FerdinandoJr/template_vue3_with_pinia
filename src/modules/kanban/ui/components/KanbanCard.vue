<template>
  <div 
    class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative"
    draggable="true"
    @dragstart="onDragStart"
  >
    <div class="flex flex-wrap gap-2 mb-3">
      <span 
        v-for="tag in task.tags" 
        :key="tag" 
        class="text-[10px] font-bold px-2.5 py-1 rounded-md border text-slate-700 bg-slate-50 border-slate-200"
        :style="generateColorFromTag(tag)"
      >
        {{ tag }}
      </span>
    </div>
    
    <h4 class="font-bold text-slate-800 text-sm mb-1.5">{{ task.title }}</h4>
    <p class="text-xs text-slate-500 mb-5 leading-relaxed">{{ task.description }}</p>
    
    <div class="flex justify-between items-center pt-3 border-t border-slate-50">
      <div class="flex -space-x-2">
        <div 
          v-for="(avatar, index) in task.assigneeAvatar" 
          :key="index"
          class="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-[2px] border-white shadow-sm ring-1 ring-slate-100 bg-blue-600"
        >
          {{ avatar }}
        </div>
      </div>
      <span class="text-[10px] font-medium text-slate-400">{{ task.date }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KanbanTask } from '../../domain/entities/KanbanTask';

const props = defineProps<{ task: KanbanTask }>();

const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('task-id', props.task.id.toString());
  }
};

const generateColorFromTag = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    backgroundColor: `hsl(${hue}, 85%, 96%)`,
    color: `hsl(${hue}, 80%, 35%)`,
    borderColor: `hsl(${hue}, 85%, 85%)`
  };
};
</script>