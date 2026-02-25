<template>
  <div class="h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar bg-[#f8fafd] p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <div class="bg-[#1a56db] rounded-[24px] p-10 text-center relative overflow-hidden shadow-lg shadow-blue-200/50">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4"></div>
        
        <div class="relative z-10 max-w-2xl mx-auto">
          <h1 class="text-3xl font-black text-white mb-3">Base de Conhecimento</h1>
          <p class="text-blue-100 text-sm font-medium mb-8">
            Encontre scripts, tutoriais e políticas para agilizar o seu atendimento.
          </p>
          
          <div class="relative">
            <input 
              v-model="searchInput"
              @input="handleSearch"
              type="text" 
              placeholder="Pesquise por uma palavra-chave (ex: Reembolso, Script)..." 
              class="w-full bg-white rounded-2xl pl-12 pr-6 py-4 text-sm font-medium text-slate-700 outline-none shadow-sm focus:ring-4 focus:ring-blue-400/30 transition-all placeholder:text-slate-400" 
            />
            <span class="absolute left-5 top-4 text-slate-400 text-lg">🔍</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
        <button 
          v-for="cat in store.availableCategories" :key="cat"
          @click="store.setCategory(cat as any)"
          :class="[
            'px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm',
            store.selectedCategory === cat 
              ? 'bg-blue-600 text-white border border-transparent' 
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="store.filteredArticles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ArticleCard 
          v-for="article in store.filteredArticles" 
          :key="article.id" 
          :article="article" 
        />
      </div>

      <div v-else class="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
        <span class="text-6xl mb-4 opacity-20 block">📄</span>
        <h3 class="text-lg font-black text-slate-800 mb-1">Nenhum artigo encontrado</h3>
        <p class="text-sm font-medium text-slate-400">
          Tente pesquisar com termos diferentes ou mude a categoria.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useKbStore } from '../store/kb.store';
import ArticleCard from '../components/ArticleCard.vue';

const store = useKbStore();
const searchInput = ref('');

const handleSearch = () => {
  store.setSearchQuery(searchInput.value);
};

onMounted(() => {
  store.fetchArticles();
});
</script>