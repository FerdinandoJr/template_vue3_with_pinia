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
        class="text-[10px] font-bold px-2.5 py-1 rounded-md border"
        :class="getTagStyle(tag)"
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
          class="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-[2px] border-white shadow-sm ring-1 ring-slate-100"
          :class="getAvatarColor(avatar)"
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

const getAvatarColor = (initials: string) => {
    if (initials === 'US') return 'bg-blue-600';
    if (initials === 'AD') return 'bg-amber-500';
    return 'bg-slate-400';
};

const getTagStyle = (tag: string) => {
  const map: Record<string, string> = {
    'Login': 'bg-green-50 text-green-700 border-green-100',
    'Dev': 'bg-blue-50 text-blue-700 border-blue-100',
    'Bug': 'bg-red-50 text-red-700 border-red-100',
    'Critical': 'bg-red-50 text-red-800 border-red-100',
    'Design': 'bg-purple-50 text-purple-700 border-purple-100',
    'UI': 'bg-purple-50 text-purple-700 border-purple-100',
    'API': 'bg-orange-50 text-orange-700 border-orange-100',
    'Infra': 'bg-slate-50 text-slate-600 border-slate-200',
    'Deploy': 'bg-slate-50 text-slate-600 border-slate-200',
    'Docs': 'bg-slate-50 text-slate-600 border-slate-200'
  };
  return map[tag] || 'bg-slate-50 text-slate-600 border-slate-100';
};
</script>