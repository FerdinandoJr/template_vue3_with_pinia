<script setup lang="ts">
import type { IKanbanCard } from '../../domain/entities/kanban-card';

const props = defineProps<{ 
  card: IKanbanCard 
}>();

const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('cardId', String(props.card.id));
    event.dataTransfer.effectAllowed = 'move';
    
    // Feedback visual suave ao começar a arrastar
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
  }
};

const onDragEnd = (event: DragEvent) => {
  const target = event.target as HTMLElement;
  target.style.opacity = '1';
};
</script>

<template>
  <div 
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    class="bg-white p-5 rounded-[20px] shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all mb-4 select-none group"
  >
    <div class="flex gap-2 mb-3">
      <span 
        v-for="tag in card.tags" 
        :key="tag.label"
        :class="['px-3 py-0.5 rounded-full text-[10px] font-bold', tag.colorClass]"
      >
        {{ tag.label }}
      </span>
    </div>
    
    <h4 class="text-[15px] font-extrabold text-slate-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
      {{ card.title }}
    </h4>
    <p class="text-[13px] text-slate-400 font-medium line-clamp-2 mb-4">
      {{ card.description }}
    </p>
    
    <div class="flex justify-between items-center pt-2">
      <div class="flex -space-x-2">
        <div 
          v-for="(avatar, index) in card.avatars" 
          :key="index"
          class="w-7 h-7 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold"
        >
          {{ avatar }}
        </div>
      </div>
      
      <span class="text-[11px] font-bold text-slate-400">
        {{ card.dateDisplay }}
      </span>
    </div>
  </div>
</template>