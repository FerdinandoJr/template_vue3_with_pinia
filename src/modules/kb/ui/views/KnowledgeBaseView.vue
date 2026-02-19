<template>
  <div class="h-full flex flex-col">
    
    <div class="flex-1 bg-white rounded-[1.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex overflow-hidden">
      
      <CategorySidebar 
          :categories="store.categories"
          :active-category="store.activeCategory"
          v-model:search-query="store.searchQuery"
          @select="store.setCategory"
      />

      <div class="flex-1 flex flex-col min-w-0 bg-white relative">
        
        <div v-if="store.loading" class="absolute inset-0 flex items-center justify-center text-slate-400 bg-white z-10">
            <span class="animate-pulse font-bold text-sm uppercase tracking-widest">Carregando...</span>
        </div>

        <ArticleList 
            v-else
            :title="store.activeCategory"
            :articles="store.filteredArticles"
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useKbStore } from '../store/kb.store';
import CategorySidebar from '../components/CategorySidebar.vue';
import ArticleList from '../components/ArticleList.vue';

const store = useKbStore();

onMounted(() => {
    store.loadData();
});
</script>