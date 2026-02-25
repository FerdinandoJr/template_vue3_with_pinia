<template>
  <div class="h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar bg-[#f8fafd] p-8">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      <div class="w-full md:w-[260px] shrink-0">
        <h1 class="text-[28px] font-black text-slate-800 mb-8 leading-none">Configurações</h1>
        
        <nav class="flex flex-col gap-2">
          <button 
            @click="store.setTab(SettingsTab.PROFILE)"
            :class="['text-left px-5 py-3.5 rounded-xl text-[13px] font-bold transition-all', store.activeTab === SettingsTab.PROFILE ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100']"
          >
            👤 Meu Perfil
          </button>
          
          <button 
            @click="store.setTab(SettingsTab.WHATSAPP)"
            :class="['text-left px-5 py-3.5 rounded-xl text-[13px] font-bold transition-all', store.activeTab === SettingsTab.WHATSAPP ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100']"
          >
            💬 Integração WhatsApp
          </button>
          
          <button 
            @click="store.setTab(SettingsTab.NOTIFICATIONS)"
            :class="['text-left px-5 py-3.5 rounded-xl text-[13px] font-bold transition-all', store.activeTab === SettingsTab.NOTIFICATIONS ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100']"
          >
            🔔 Notificações
          </button>
        </nav>
      </div>

      <div class="flex-1 mt-10 md:mt-14">
        <div v-if="store.loading" class="flex justify-center py-20">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        <template v-else>
          <ProfileSettings v-if="store.activeTab === SettingsTab.PROFILE" :profile="store.profile" />
          
          <WhatsAppSettings v-if="store.activeTab === SettingsTab.WHATSAPP" :whatsapp="store.whatsapp" />
          
          <div v-if="store.activeTab === SettingsTab.NOTIFICATIONS" class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-3xl">
            <h2 class="text-xl font-black text-slate-800 mb-4">Preferências de Notificação</h2>
            <p class="text-sm font-medium text-slate-400">As opções de som e alertas aparecerão aqui.</p>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from '../store/settings.store';
import { SettingsTab } from '../../domain/valueObjects/settings-enums';
import ProfileSettings from '../components/ProfileSettings.vue';
import WhatsAppSettings from '../components/WhatsAppSettings.vue';

const store = useSettingsStore();

onMounted(() => {
  store.fetchSettingsData();
});
</script>