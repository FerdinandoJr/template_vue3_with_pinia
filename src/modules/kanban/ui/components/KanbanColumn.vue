<script setup lang="ts">
import { ref } from 'vue';
import { useKanbanStore } from '../store/kanban.store';
import { KanbanStatus } from '../../domain/valueObjects/kanban-status.enum';
import KanbanCard from './KanbanCard.vue';

const props = defineProps<{ 
  title: string;
  status: KanbanStatus;
  cards: any[]; 
}>();

const store = useKanbanStore();
const isOver = ref(false);

const onDragOver = () => {
  isOver.value = true;
};

const onDragLeave = () => {
  isOver.value = false;
};

const onDrop = (event: DragEvent) => {
  isOver.value = false;
  const cardId = event.dataTransfer?.getData('cardId');
  if (cardId) {
    store.moveCard(cardId, props.status);
  }
};
</script>

<template>
  <div 
    class="flex-shrink-0 w-[320px] bg-[#f8fafd] rounded-[24px] flex flex-col border border-slate-50 transition-all duration-200 shadow-sm h-full"
    :class="{ 'bg-blue-50/80 border-blue-200 ring-4 ring-blue-100/30 scale-[1.01]': isOver }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="p-6 flex justify-between items-center sticky top-0 bg-[#f8fafd] rounded-t-[24px] z-10">
      <h3 class="font-extrabold text-slate-800 text-[16px]">{{ title }}</h3>
      <div class="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center">
        <span class="text-slate-600 text-[12px] font-black">{{ cards.length }}</span>
      </div>
    </div>

    <div 
      class="flex-1 overflow-y-auto px-4 pb-10 custom-scrollbar min-h-[500px]"
    >
      <KanbanCard 
        v-for="card in cards" 
        :key="card.id" 
        :card="card" 
      />
      
      <div 
        v-if="cards.length === 0" 
        class="h-32 border-2 border-dashed border-slate-200 rounded-[20px] flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest pointer-events-none"
      >
        Solte Aqui
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 0px;
}
</style>