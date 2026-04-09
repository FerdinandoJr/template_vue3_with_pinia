<template>
  <div class="flex h-[100dvh] w-full bg-[#f8fafc] font-sans overflow-hidden relative">

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false"
      class="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"></div>

    <aside :class="[
      'fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none flex flex-col h-full shrink-0',
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <AppSidebar class="h-full w-full" @click="isSidebarOpen = false" />
    </aside>

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
      <header class="h-16 sm:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-30">
        <AppHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      </header>

      <main :class="['flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] relative z-0', route.meta.noPadding ? 'p-0' : 'p-4 sm:p-6 lg:p-8']">
        <router-view />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import ToastContainer from '@/core/components/ToastContainer.vue'
import AppHeader from './AppHeader.vue'
import { useChatStore } from '@/modules/chats/ui/store/chat.store'

const route = useRoute()
const isSidebarOpen = ref(false)
const chatStore = useChatStore()

onMounted(() => {
  if (typeof chatStore.initSlaMonitor === 'function') {
    chatStore.initSlaMonitor()
  }
})
</script>