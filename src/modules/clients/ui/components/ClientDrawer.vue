<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" @click="$emit('close')"></div>
    <div class="absolute inset-y-0 right-0 pl-10 max-w-full flex">
      <div class="w-screen max-w-md transform transition ease-in-out duration-300 bg-white shadow-2xl flex flex-col">
        
        <div v-if="client" class="bg-slate-50 border-b border-slate-200 p-6 flex items-start justify-between">
           <div class="flex gap-4">
             <div class="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-700 shadow-sm">{{ client.avatar }}</div>
             <div>
               <h2 class="font-bold text-lg text-slate-800">{{ client.name }}</h2>
               <p class="text-slate-500 text-sm">{{ client.company }}</p>
               <div class="flex gap-2 mt-2">
                 <button class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold hover:bg-green-200 transition flex items-center gap-1">📱 WhatsApp</button>
                 <button class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200 transition flex items-center gap-1">📧 Email</button>
               </div>
             </div>
           </div>
           <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <div v-if="client" class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="p-3 border border-slate-200 rounded-lg text-center hover:bg-slate-50 cursor-pointer transition">
              <div class="text-2xl mb-1">🎫</div>
              <div class="text-xs font-bold text-slate-700">Abrir Ticket</div>
            </div>
            <div class="p-3 border border-slate-200 rounded-lg text-center hover:bg-slate-50 cursor-pointer transition">
              <div class="text-2xl mb-1">📝</div>
              <div class="text-xs font-bold text-slate-700">Anotação</div>
            </div>
          </div>
          
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Histórico Recente</h3>
          <div class="space-y-6 relative">
            <div class="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
            
            <div class="relative pl-10">
              <div class="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm z-10">💬</div>
              <div>
                <span class="text-xs text-slate-400">Há 10 min • WhatsApp</span>
                <p class="text-sm text-slate-800 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">"Estou com dificuldade para acessar o relatório fiscal. Aparece erro 404."</p>
              </div>
            </div>

            <div class="relative pl-10">
              <div class="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm z-10">🎫</div>
              <div>
                <span class="text-xs text-slate-400">Ontem • Ticket #9021</span>
                <p class="text-sm font-semibold text-slate-800 mt-1">Falha na integração bancária</p>
                <span class="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Resolvido</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button class="w-full bg-slate-800 text-white font-medium py-3 rounded-lg hover:bg-slate-900 transition">Ver Perfil Completo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Client } from '../../domain/entities/Client';

defineProps<{
  isOpen: boolean;
  client?: Client;
}>();

defineEmits(['close']);
</script>