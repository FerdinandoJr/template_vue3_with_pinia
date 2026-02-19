<template>
  <div class="h-[calc(100vh-140px)] overflow-x-auto overflow-y-hidden custom-scrollbar px-1">
    
    <div v-if="store.loading" class="flex items-center justify-center h-full text-slate-400">
        Carregando quadro...
    </div>

    <div v-else class="flex gap-6 h-full min-w-max pb-4">
      <KanbanColumn 
          v-for="col in store.columns" 
          :key="col.id" 
          :column="col"
          @move-task="handleMoveTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useKanbanStore } from '../store/kanban.store';
import KanbanColumn from '../components/KanbanColumn.vue';

const store = useKanbanStore();

const handleMoveTask = (payload: { taskId: number, from: string, to: string }) => {
    store.moveCard(payload.taskId, payload.from, payload.to);
};

onMounted(() => {
    store.loadBoard();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { height: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>