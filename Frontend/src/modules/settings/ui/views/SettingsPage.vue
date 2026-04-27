<template>
  <div class="h-[calc(100vh-4rem)] overflow-hidden custom-scrollbar bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div class="h-full flex">
      <!-- Sidebar -->
      <aside class="w-72 bg-white border-r border-slate-200/60 flex flex-col shadow-lg shadow-slate-200/30">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span class="text-white text-xl">⚙️</span>
            </div>
            <div>
              <h1 class="text-lg font-black text-slate-800 leading-tight">Configurações</h1>
              <p class="text-[11px] font-medium text-slate-400">Central de gerenciamento</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 overflow-y-auto">
          <div class="space-y-1">
            <!-- Seção Geral -->
            <div class="mb-6">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">GERAL</p>
              
              <button 
                @click="store.setTab(SettingsTab.PROFILE)" 
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200', store.activeTab === SettingsTab.PROFILE ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-800/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800']"
              >
                <span class="text-lg">👤</span>
                Meu Perfil
                <div v-if="store.activeTab === SettingsTab.PROFILE" class="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
              </button>
              
              <button 
                @click="store.setTab(SettingsTab.NOTIFICATIONS)" 
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200', store.activeTab === SettingsTab.NOTIFICATIONS ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-800/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800']"
              >
                <span class="text-lg">🔔</span>
                Notificações
              </button>
            </div>

            <!-- Seção Administração -->
            <div v-if="authStore.hasFeature('admin', 'user_access') || authStore.hasFeature('admin', 'roles')" class="mb-6">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">ADMINISTRAÇÃO</p>
              
              <button 
                v-if="authStore.hasFeature('admin', 'user_access')"
                @click="store.setTab(SettingsTab.USER_ACCESS)" 
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200', store.activeTab === SettingsTab.USER_ACCESS ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800']"
              >
                <span class="text-lg">👥</span>
                Acesso por Usuário
              </button>
              
              <button 
                v-if="authStore.hasFeature('admin', 'roles')"
                @click="store.setTab(SettingsTab.ROLES)" 
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200', store.activeTab === SettingsTab.ROLES ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800']"
              >
                <span class="text-lg">🎭</span>
                Cargos
              </button>
            </div>

            <!-- Seção Integrações -->
            <div v-if="authStore.hasFeature('admin', 'whatsapp')" class="mb-6">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">INTEGRAÇÕES</p>
              
              <button 
                @click="store.setTab(SettingsTab.WHATSAPP)" 
                :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200', store.activeTab === SettingsTab.WHATSAPP ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg shadow-green-500/30' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800']"
              >
                <span class="text-lg">💬</span>
                WhatsApp
              </button>
            </div>
          </div>
        </nav>

      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="store.loading" class="h-full flex items-center justify-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <p class="text-sm font-medium text-slate-500">Carregando configurações...</p>
          </div>
        </div>
        
        <template v-else>
          <div class="p-8">
            <!-- Transitions -->
            <Transition name="fade" mode="out-in">
              <ProfileSettings v-if="store.activeTab === SettingsTab.PROFILE" :profile="store.profile" />
              <UserAccessSettings v-else-if="store.activeTab === SettingsTab.USER_ACCESS && authStore.hasFeature('admin', 'user_access')" />
              <RolesSettings v-else-if="store.activeTab === SettingsTab.ROLES && authStore.hasFeature('admin', 'roles')" />
              <WhatsAppSettings v-else-if="store.activeTab === SettingsTab.WHATSAPP && authStore.hasFeature('admin', 'whatsapp')" :whatsapp="store.whatsapp" />
              <NotificationSettings v-else-if="store.activeTab === SettingsTab.NOTIFICATIONS" />
            </Transition>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useSettingsStore } from '../store/settings.store';
import { SettingsTab } from '../../domain/valueObjects/settings-enums';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

import ProfileSettings from '../components/ProfileSettings.vue';
import WhatsAppSettings from '../components/WhatsAppSettings.vue';
import NotificationSettings from '../components/NotificationSettings.vue';
import UserAccessSettings from '../components/UserAccessSettings.vue';
import RolesSettings from '../components/RolesSettings.vue';

const store = useSettingsStore();
const authStore = useAuthStore();

onMounted(async () => {
  store.setTab(SettingsTab.PROFILE);
  
  // Esperar auth carregar se necessário
  if (!authStore.isReady && authStore.token) {
    await authStore.initAuth();
  }
  
  store.fetchSettingsData();
});

watch(() => authStore.isReady, (ready) => {
  if (ready) {
    store.fetchSettingsData();
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>