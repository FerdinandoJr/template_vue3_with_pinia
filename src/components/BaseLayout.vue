<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <Sidebar />
    
    <!-- Main Content Area -->
    <div class="flex-1 ml-64">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div class="px-8 py-4 flex items-center justify-between">
          <div>
            <h1 v-if="pageTitle" class="text-2xl font-bold text-slate-800">{{ pageTitle }}</h1>
            <p v-if="pageSubtitle" class="text-slate-600 text-sm mt-1">{{ pageSubtitle }}</p>
          </div>
          
          <!-- Header Actions Slot -->
          <div v-if="$slots.headerActions" class="flex items-center gap-3">
            <slot name="headerActions"></slot>
          </div>
          
          <!-- Default Header Actions (if no slot provided) -->
          <div v-else class="flex items-center gap-4">
            <!-- Notifications -->
            <button 
              class="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              title="Notificações"
            >
              <span class="text-xl">🔔</span>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <!-- User Menu -->
            <div class="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-all">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div class="hidden md:block">
                <p class="text-sm font-semibold text-slate-800">Usuário</p>
                <p class="text-xs text-slate-500">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Content Area - Router View -->
      <main class="p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'

const route = useRoute()

// Read title and subtitle from route meta
const pageTitle = computed(() => route.meta.title as string || '')
const pageSubtitle = computed(() => route.meta.subtitle as string || '')
</script>
