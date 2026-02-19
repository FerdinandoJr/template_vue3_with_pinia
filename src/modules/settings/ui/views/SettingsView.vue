<template>
  <div class="h-[calc(100vh-140px)] flex bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
    
    <SettingsSidebar v-model:active-tab="store.activeTab" />

    <div class="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
      
      <div v-if="store.loading" class="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
        <span class="text-slate-400 font-bold animate-pulse">Processando...</span>
      </div>

      <ProfilePanel 
        v-if="store.activeTab === 'perfil'" 
        :profile="store.profile"
        @save="store.saveProfile"
      />

      <SecurityPanel 
        v-if="store.activeTab === 'seguranca'"
        v-model="store.preferences.twoFactorAuth"
        @change="store.savePreferences"
      />

      <div v-if="['notificacoes', 'sistema', 'equipe'].includes(store.activeTab)" class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
        <span class="text-4xl mb-4">🚧</span>
        <p class="font-bold uppercase tracking-widest text-sm">Em desenvolvimento</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from '../store/settings.store';
import SettingsSidebar from '../components/SettingsSidebar.vue';
import ProfilePanel from '../components/ProfilePanel.vue';
import SecurityPanel from '../components/SecurityPanel.vue';

const store = useSettingsStore();

onMounted(() => {
    store.loadSettings();
});
</script>