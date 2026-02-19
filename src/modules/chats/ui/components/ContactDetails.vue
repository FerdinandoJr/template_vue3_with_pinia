<template>
  <div class="w-80 bg-white border-l border-slate-100 flex flex-col overflow-y-auto h-full">
    <div class="p-8 flex flex-col items-center border-b border-slate-50">
      <img :src="chat.photoUrl" class="w-24 h-24 rounded-full object-cover shadow-lg mb-4 ring-4 ring-slate-50">
      <h3 class="text-lg font-bold text-slate-800">{{ chat.name }}</h3>
      <p class="text-sm text-slate-500">{{ chat.company }}</p>
      <div class="flex gap-2 mt-6 w-full">
        <button class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition border border-slate-200">Perfil</button>
        <button class="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition border border-slate-200">Tickets</button>
      </div>
    </div>
    <div class="p-6 space-y-6">
      <div>
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contato</h4>
        <div class="space-y-3">
           <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
             <span class="text-slate-400">✉️</span><span class="text-sm text-slate-700 truncate">{{ chat.email }}</span>
           </div>
           <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
             <span class="text-slate-400">📞</span><span class="text-sm text-slate-700">{{ chat.phone }}</span>
           </div>
        </div>
      </div>
      <div>
         <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</h4>
         <div class="flex flex-wrap gap-2">
           <span v-for="tag in chat.tags" :key="tag" class="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">{{ tag }}</span>
           <button class="px-2.5 py-1 border border-dashed border-slate-300 text-slate-400 text-xs rounded-md hover:border-blue-400 hover:text-blue-500">+</button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatContact } from '../../domain/entities/ChatContact';

defineProps<{ chat: ChatContact }>();
</script>