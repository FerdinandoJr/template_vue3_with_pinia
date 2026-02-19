<template>
  <div class="w-72 bg-white border-r border-slate-100 flex flex-col p-6 shrink-0 h-full">
    <div class="relative mb-8">
      <span class="absolute left-4 top-3 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </span>
      <input 
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        type="text" 
        placeholder="Pesquisar..." 
        class="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-blue-300 transition-all placeholder-slate-400"
      >
    </div>

    <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Categorias</h3>
    <nav class="space-y-1">
      <button 
        v-for="cat in categories" 
        :key="cat" 
        @click="$emit('select', cat)" 
        class="w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200" 
        :class="activeCategory === cat ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'"
      >
        {{ cat }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  categories: string[];
  activeCategory: string;
  searchQuery: string;
}>();

defineEmits(['select', 'update:searchQuery']);
</script>