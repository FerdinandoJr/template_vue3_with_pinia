<template>
  <div class="flex w-full items-center">
    <div>
      <h1 v-if="pageTitle" class="text-xl font-bold text-slate-800">{{ pageTitle }}</h1>
      <p v-if="pageSubtitle" class="text-sm text-slate-500 mt-0.5">{{ pageSubtitle }}</p>
    </div>

    <div class="flex-1 flex items-center justify-end gap-4">
      <div class="relative hidden md:block group">
        <span class="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          class="w-64 bg-slate-50 text-sm pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
        >
      </div>
      <div class="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
      <button class="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        <span class="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
      </div>
    </div>    
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'

const route = useRoute()

const isSidebarOpen = ref(false)

const pageTitle = computed(() => route.meta.title as string || '')
const pageSubtitle = computed(() => route.meta.subtitle as string || '')
</script>