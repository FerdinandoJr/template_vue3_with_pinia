<template>
  <div class="flex h-screen w-screen bg-slate-50 font-sans overflow-hidden relative">

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
      class="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"></div>

    <aside :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none flex flex-col h-full',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <AppSidebar class="h-full" @click="isSidebarOpen = false" />
    </aside>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
        <AppHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      </header>

      <main :class="['flex-1 overflow-y-auto bg-slate-50', route.meta.noPadding ? 'p-0' : 'p-4 lg:p-8']">
        <router-view />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import ToastContainer from '@/core/components/ToastContainer.vue'
import AppHeader from './AppHeader.vue'

const route = useRoute()
const isSidebarOpen = ref(false)
</script>