<template>
  <div class="p-8 h-full bg-white">
    <div v-if="store.loading" class="flex justify-center p-10">
      <span class="text-slate-500 animate-pulse">Carregando quadro...</span>
    </div>

    <div v-else class="flex gap-8 h-full overflow-x-auto items-start pb-6">
      <KanbanColumn 
        title="A Fazer" 
        :status="KanbanStatus.TODO" 
        :cards="store.todoCards" 
      />
      <KanbanColumn 
        title="Em Progresso" 
        :status="KanbanStatus.IN_PROGRESS" 
        :cards="store.inProgressCards" 
      />
      <KanbanColumn 
        title="Em Revisão" 
        :status="KanbanStatus.REVIEW" 
        :cards="store.reviewCards" 
      />
      <KanbanColumn 
        title="Concluído" 
        :status="KanbanStatus.DONE" 
        :cards="store.doneCards" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useKanbanStore } from '../store/kanban.store';
import { KanbanStatus } from '../../domain/valueObjects/kanban-status.enum';
import KanbanColumn from '../components/KanbanColumn.vue';

const store = useKanbanStore();

onMounted(() => {
  store.fetchCards();
});
</script>