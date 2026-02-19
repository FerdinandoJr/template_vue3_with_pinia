<template>
  <div class="flex-1 flex flex-col bg-white relative min-w-0 h-full">
    <div v-if="activeChat" class="h-20 px-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 z-10 bg-white/80 backdrop-blur-md sticky top-0">
      <div class="flex items-center gap-4">
        <img :src="activeChat.photoUrl" class="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-200 border border-slate-100">
        <div>
          <h2 class="font-bold text-slate-800">{{ activeChat.name }}</h2>
          <div class="flex items-center gap-2">
            <p class="text-xs text-slate-500">{{ activeChat.company }}</p>
            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
            <span class="text-[10px] bg-green-50 text-green-700 px-1.5 rounded font-medium uppercase">{{ activeChat.channel }}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">Transferir</button>
        <div class="h-8 w-px bg-slate-100 mx-1"></div>
        <button @click="$emit('toggle-sidebar')" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition" title="Informações">
          ℹ️
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30" ref="messagesContainer">
      <div v-for="msg in messages" :key="msg.id">
        <div v-if="msg.sender === 'system'" class="flex justify-center">
            <span class="text-[10px] font-medium text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{{ msg.text }}</span>
        </div>
        
        <div v-else-if="msg.type === 'note'" class="flex justify-center">
          <div class="bg-yellow-50 border border-yellow-100 px-4 py-2 rounded-lg max-w-lg flex items-center gap-3 shadow-sm">
            <span class="text-yellow-500 text-sm">🔒</span>
            <p class="text-xs text-yellow-800 italic">{{ msg.text }}</p>
          </div>
        </div>
        
        <div v-else :class="['flex gap-3 max-w-[80%]', msg.sender === 'me' ? 'ml-auto flex-row-reverse' : '']">
          <img :src="msg.sender === 'me' ? 'https://ui-avatars.com/api/?name=Eu&background=3b82f6&color=fff' : activeChat?.photoUrl" class="w-8 h-8 rounded-full object-cover shadow-sm self-end border border-white">
          <div class="flex flex-col gap-1" :class="msg.sender === 'me' ? 'items-end' : 'items-start'">
            <div class="px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all border" :class="msg.sender === 'me' ? 'bg-blue-600 text-white border-blue-600 rounded-tr-sm' : 'bg-white text-slate-800 border-slate-200 rounded-tl-sm'">{{ msg.text }}</div>
            <span class="text-[10px] text-slate-400 px-1">{{ msg.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeChat" class="p-4 bg-white border-t border-slate-100">
      <div class="flex items-end gap-2 p-2 rounded-xl border transition-colors relative" :class="isInternalNote ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50/50 focus-within:bg-white'">
        <button @click="isInternalNote = !isInternalNote" class="p-2 rounded-lg transition-colors mb-0.5" :class="isInternalNote ? 'bg-yellow-200 text-yellow-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'" title="Nota Interna">
          🔒
        </button>
        <textarea 
            v-model="newMessage" 
            @keyup.enter.exact="send" 
            rows="1" 
            :placeholder="isInternalNote ? 'Escrever nota interna...' : 'Digite sua mensagem...'" 
            class="flex-1 bg-transparent border-none outline-none text-sm py-2.5 max-h-32 resize-none" 
            style="min-height: 44px;"
        ></textarea>
        <button @click="send" class="p-2 rounded-lg mb-0.5 transition-all shadow-sm" :class="newMessage.trim() ? (isInternalNote ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-blue-600 text-white hover:bg-blue-700') : 'bg-slate-200 text-slate-400 cursor-default'">
          ➤
        </button>
      </div>
      <div v-if="isInternalNote" class="text-[10px] text-yellow-600 font-medium mt-1 ml-1 flex items-center gap-1"><span>🔒</span> Modo Nota Interna Ativo</div>
    </div>
    
    <div v-else class="flex-1 flex items-center justify-center text-slate-400">
        Selecione uma conversa para começar
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { ChatContact } from '../../domain/entities/ChatContact';
import type { ChatMessage } from '../../domain/entities/ChatMessage';

const props = defineProps<{
  activeChat?: ChatContact;
  messages: ChatMessage[];
}>();

const emit = defineEmits(['send', 'toggle-sidebar']);

const newMessage = ref('');
const isInternalNote = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => { 
    nextTick(() => { 
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; 
        }
    }); 
};

watch(() => props.messages.length, scrollToBottom);
watch(() => props.activeChat, scrollToBottom);

const send = () => {
    if (!newMessage.value.trim()) return;
    emit('send', newMessage.value, isInternalNote.value);
    newMessage.value = '';
    isInternalNote.value = false;
};
</script>