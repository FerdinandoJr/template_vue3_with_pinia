<template>
  <div class="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden">
    <aside 
      class="inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-xl lg:shadow-none flex flex-col h-full"
    >
      <AppSidebar class="h-full" />
    </aside>
    
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      
      <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
        <AppHeader />
      </header>
      
      <main :class="['flex-1 overflow-y-auto bg-slate-50', route.meta.noPadding ? 'p-0' : 'p-4 lg:p-8']">
        <router-view />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import ToastContainer from '@/core/components/ToastContainer.vue'
import AppHeader from './AppHeader.vue'

const route = useRoute()
</script>