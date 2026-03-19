<template>
  <div class="flex w-full items-center">

    <div class="flex items-center gap-3">
      <button @click="$emit('toggle-sidebar')"
        class="lg:hidden p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div>
        <h1 v-if="pageTitle" class="text-xl font-bold text-slate-800 truncate max-w-[150px] sm:max-w-full">{{ pageTitle
        }}</h1>
        <p v-if="pageSubtitle" class="text-sm text-slate-500 mt-0.5 hidden sm:block">{{ pageSubtitle }}</p>
      </div>
    </div>

    <div class="flex-1 flex items-center justify-end gap-2 sm:gap-4">

      <el-popover placement="bottom-end" :width="340" trigger="click"
        popper-class="!p-0 !rounded-2xl shadow-2xl border-slate-100">
        <template #reference>
          <button
            class="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>

            <span v-if="notificationStore.unreadCount > 0"
              class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce-short">
              {{ notificationStore.unreadCount }}
            </span>
          </button>
        </template>

        <div class="flex flex-col max-h-[400px]">
          <div
            class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl shrink-0">
            <h3 class="font-bold text-slate-800 text-sm">Notificações</h3>
            <el-button v-if="notificationStore.unreadCount > 0" link type="primary" size="small"
              @click="notificationStore.markAllAsRead()" class="!font-semibold">
              Marcar tudo como lido
            </el-button>
          </div>

          <div class="overflow-y-auto p-3 custom-scrollbar flex-1">
            <div v-if="notificationStore.unreadCount === 0" class="py-8 text-center text-slate-400">
              <svg class="w-8 h-8 mb-2 mx-auto opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <p class="text-sm font-medium">Nenhuma notificação nova.</p>
            </div>

            <div v-else class="space-y-2">
              <div v-for="notif in notificationStore.unreadNotifications" :key="notif.id"
                class="p-3 bg-blue-50 hover:bg-blue-100/50 rounded-xl transition-colors border border-blue-100 flex gap-3 relative group">
                <div class="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shadow-sm shadow-blue-300 shrink-0"></div>
                <div class="flex-1 pr-6">
                  <p class="text-xs font-extrabold text-slate-800 mb-1 leading-tight">{{ notif.title }}</p>
                  <p class="text-xs text-slate-600 leading-snug mb-2">{{ notif.message }}</p>
                  <span class="text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-md">Hoje às {{
                    notif.time
                  }}</span>
                </div>

                <button @click="notificationStore.markAsRead(notif.id)"
                  class="absolute top-3 right-3 text-slate-400 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm border border-slate-100"
                  title="Marcar como lido">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useNotificationStore } from '@/core/store/notifications.store'

const route = useRoute()
const notificationStore = useNotificationStore()

defineEmits(['toggle-sidebar'])

const pageTitle = computed(() => route.meta.title as string || '')
const pageSubtitle = computed(() => route.meta.subtitle as string || '')

onMounted(() => {
  notificationStore.checkTodayEvents()
})
</script>