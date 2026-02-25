<template>
  <div class="flex-1 flex flex-col h-full bg-white relative border-r border-slate-200">
    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
      <div class="flex items-center gap-3">
        <img :src="contact.avatar" class="w-11 h-11 rounded-full object-cover" />
        <div>
          <h3 class="font-black text-slate-800 text-[15px] leading-tight mb-0.5">{{ contact.name }}</h3>
          <p class="text-[11px] font-bold text-slate-400">
            {{ contact.company }} • <span class="text-[#22c55e] font-black uppercase">{{ contact.channel }}</span>
          </p>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button @click="$emit('transfer', contact.id)" class="px-5 py-2 border border-slate-200 rounded-[10px] text-[12px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          Transferir
        </button>
        <button class="w-[36px] h-[36px] border border-slate-200 rounded-[10px] flex items-center justify-center text-slate-400 hover:bg-slate-50">
          <span class="text-[14px]">ℹ️</span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-white custom-scrollbar">
      <div class="flex justify-center mb-6">
        <span class="bg-[#f1f5f9] text-slate-400 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Atendimento Iniciado.</span>
      </div>

      <div v-for="m in messages" :key="m.id" class="w-full flex flex-col">
        <div v-if="m.type === 'alert'" class="flex justify-center my-2">
          <div class="bg-[#fff9e6] border border-[#ffecb3] px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm">
            <span class="text-amber-500 text-sm">🔒</span>
            <span class="text-[13px] italic text-[#b48600] font-bold">{{ m.text }}</span>
          </div>
        </div>
        
        <div v-else :class="['flex w-full', m.isMine ? 'justify-end' : 'justify-start']">
          <div class="relative flex items-end gap-2 max-w-[70%]">
            <div :class="['px-5 py-3.5 rounded-[18px] text-[14px] font-medium shadow-sm leading-relaxed', m.isMine ? 'bg-[#2563eb] text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none']">
              {{ m.text }}
              <div :class="['text-[9px] mt-1 font-bold opacity-60', m.isMine ? 'text-right text-blue-100' : 'text-left text-slate-400']">{{ m.timestamp }}</div>
            </div>
            <div v-if="m.isMine" class="w-8 h-8 bg-[#2563eb] rounded-full flex shrink-0 items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-sm mb-1">
              EU
            </div>
            <img v-else :src="contact.avatar" class="w-8 h-8 rounded-full border-2 border-white shadow-sm mb-1 shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <div class="px-6 py-5 bg-white border-t border-slate-100">
      <div class="bg-[#f8fafd] border border-slate-200 rounded-2xl p-1.5 flex items-center gap-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
        <button class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600">📎</button>
        <input 
          v-model="text" 
          @keyup.enter="send" 
          placeholder="Digite sua mensagem..." 
          class="flex-1 bg-transparent border-none text-[14px] outline-none text-slate-700 font-medium placeholder:text-slate-400" 
        />
        <button 
          @click="send" 
          class="w-10 h-10 bg-[#2563eb] rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
        >
          <span class="text-lg leading-none">✈️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ contact: any, messages: any[] }>();
const emit = defineEmits(['send', 'transfer']);
const text = ref('');

const send = () => { 
  if(text.value.trim()) { 
    emit('send', text.value); 
    text.value = ''; 
  } 
};
</script>