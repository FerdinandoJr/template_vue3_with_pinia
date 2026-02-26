<template>
  <div class="flex flex-col h-full bg-slate-50 relative items-center pt-8 overflow-y-auto custom-scrollbar border-l border-slate-200">
    
    <div class="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 text-3xl mb-4 shadow-sm overflow-hidden">
      <span v-if="!contact.avatar || contact.avatar.includes('?')">?</span>
      <img v-else :src="contact.avatar" class="w-full h-full object-cover" />
    </div>
    
    <h2 class="text-lg font-black text-slate-800 tracking-tight">{{ contact.name }}</h2>
    <p v-if="contact.company" class="text-xs text-slate-500 font-medium mt-0.5">{{ contact.company }}</p>

    <div class="flex gap-2 mt-6 w-full px-6">
      <button class="flex-1 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 shadow-sm transition-colors">
        PERFIL
      </button>
      <button class="flex-1 py-2.5 bg-transparent text-slate-500 rounded-lg text-xs font-black hover:bg-slate-200 transition-colors">
        TICKETS
      </button>
    </div>

    <div class="w-full px-6 mt-8">
      <h4 class="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Contato</h4>
      
      <div class="bg-white border border-slate-100 rounded-xl mb-6 shadow-sm flex flex-col overflow-hidden">
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <span class="text-[13px] font-semibold text-slate-600 truncate">{{ contact.email || 'Não informado' }}</span>
        </div>
        
        <div class="flex items-center gap-3 px-4 py-3.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pink-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <span class="text-[13px] font-semibold text-slate-700">{{ contact.phone }}</span>
        </div>
      </div>
    </div>

    <div class="w-full px-6">
      <h4 class="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Tags</h4>
      <div class="flex flex-wrap gap-2">
        <span v-if="contact.company" class="px-3 py-1.5 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase">B2B</span>
        
        <button class="w-7 h-7 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { IContact } from '../../domain/entities/chat';
defineProps<{ contact: IContact }>();
</script>