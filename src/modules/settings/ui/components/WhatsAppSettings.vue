<template>
  <div v-if="whatsapp" class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-xl font-black text-slate-800 mb-1">Conexão WhatsApp</h2>
        <p class="text-[13px] font-medium text-slate-400">Gerencie o dispositivo conectado à API.</p>
      </div>
      <div class="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-xl">
        <div class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-[11px] font-black text-green-700 uppercase tracking-widest">{{ whatsapp.status }}</span>
      </div>
    </div>

    <div class="bg-[#f8fafd] border border-slate-100 rounded-[16px] p-6 flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">📱</div>
        <div>
          <h4 class="text-[14px] font-black text-slate-800">{{ whatsapp.phoneNumber }}</h4>
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aparelho Principal</span>
        </div>
      </div>
      <div class="text-right">
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Bateria</p>
        <span class="text-[14px] font-black text-slate-800 flex items-center gap-1 justify-end">
          {{ whatsapp.batteryLevel }}% ⚡
        </span>
      </div>
    </div>

    <div class="flex gap-4">
      
      <button 
        v-if="authStore.hasRole(['ADMIN'])"
        class="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-red-100 transition-colors"
      >
        Desconectar Aparelho
      </button>
      
      <button class="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors">
        Sincronizar Contatos
      </button>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IWhatsAppConfig } from '../../domain/entities/settings';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

defineProps<{ whatsapp: IWhatsAppConfig | null }>();

const authStore = useAuthStore();
</script>