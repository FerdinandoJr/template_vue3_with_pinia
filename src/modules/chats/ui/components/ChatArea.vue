<template>
  <div class="flex-1 flex flex-col h-full bg-[#efeae2] relative border-r border-slate-200"
    @click="isAttachmentMenuOpen = false">

    <div class="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-white z-10 shadow-sm shrink-0"
      @click.stop>

      <div @click="$emit('toggle-profile')"
        class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-xl transition-colors group">
        <div
          class="relative w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-lg group-hover:ring-2 ring-blue-100 transition-all overflow-hidden shrink-0">
          <span v-if="!contact?.avatar || contact?.avatar?.includes('?')">?</span>
          <img v-else :src="contact.avatar" class="w-full h-full object-cover" />
        </div>
        <div>
          <h3
            class="font-bold text-slate-800 text-[14px] leading-tight mb-0.5 group-hover:text-blue-600 transition-colors">
            {{ contact?.name || 'Carregando...' }}</h3>
          <p class="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <span v-if="contact?.company">{{ contact.company }} • </span>
            <span class="text-[#25D366] font-black uppercase tracking-widest">{{ contact?.channel || 'WHATSAPP'
              }}</span>
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <button v-if="isUnsavedContact" @click="$emit('vincular')"
          class="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[12px] font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
          Adicionar
        </button>

        <template v-if="!isChatActive">
          <button @click="$emit('assumir', contact?.id)"
            class="px-5 py-2 bg-[#25D366] text-white rounded-lg text-[12px] font-bold hover:bg-[#20bd5a] transition-colors flex items-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Assumir Chamado
          </button>
        </template>

        <template v-if="isChatActive">
          <button @click="$emit('abrir-modal-ticket', contact)"
            class="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[12px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z">
              </path>
              <path d="M13 5v2"></path>
              <path d="M13 17v2"></path>
              <path d="M13 11v2"></path>
            </svg>
            Ticket
          </button>

          <button @click="$emit('transferir', contact?.id)"
            class="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[12px] font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 10 20 15 15 20"></polyline>
              <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
            </svg>
            Transferir
          </button>

          <button @click="$emit('finalizar', contact?.id)"
            class="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[12px] font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
            Finalizar
          </button>
        </template>
      </div>
    </div>

    <div ref="messagesContainer"
      class="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar bg-opacity-90 scroll-smooth"
      style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-repeat: repeat; opacity: 0.85;">
      <div v-for="m in (messages || [])" :key="m.id" class="w-full flex flex-col relative z-10">
        <div v-if="m.type === 'alert'" class="flex justify-center my-3">
          <div
            class="bg-green-100 border border-green-300 px-4 py-2 rounded-lg shadow-sm max-w-[80%] text-[12px] text-green-900 font-medium whitespace-pre-wrap text-center">
            {{ m.text }}
          </div>
        </div>

        <div v-else-if="m.type === 'note'" class="flex w-full justify-end">
          <div class="relative flex items-end gap-2 max-w-[65%]">
            <div
              class="px-4 py-3 rounded-lg text-[14px] shadow-sm flex flex-col bg-amber-100 border border-amber-300 text-amber-900 rounded-tr-none">
              <div
                class="flex items-center gap-1.5 mb-1.5 text-amber-700 text-[10px] font-black uppercase tracking-widest border-b border-amber-300/60 pb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Nota Interna (Invisível ao Cliente)
              </div>
              <span class="leading-relaxed whitespace-pre-wrap font-medium">{{ m.text }}</span>
              <div class="text-[10px] font-bold mt-1 text-right text-amber-600">{{ m.timestamp }}</div>
            </div>
          </div>
        </div>

        <div v-else :class="['flex w-full', m.isMine ? 'justify-end' : 'justify-start']">
          <div class="relative flex items-end gap-2 max-w-[65%]">
            <div
              :class="['px-3 py-2 rounded-lg text-[14px] shadow-sm flex flex-col', m.isMine ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none']">
              <span class="leading-relaxed whitespace-pre-wrap">{{ m.text }}</span>
              <div class="text-[10px] text-slate-400 font-semibold mt-1 text-right flex justify-end items-center gap-1">
                {{ m.timestamp }}
                <span v-if="m.isMine" class="text-blue-500">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="shrink-0 flex flex-col bg-[#f0f2f5] relative" @click.stop>

      <div v-if="attachedFile"
        class="absolute bottom-[100%] left-0 w-full p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div v-if="attachedFileUrl"
          class="w-12 h-12 rounded bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
          <img :src="attachedFileUrl" class="w-full h-full object-cover" />
        </div>
        <div v-else
          class="w-12 h-12 bg-blue-100 text-blue-600 rounded border border-blue-200 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-slate-700 truncate">{{ attachedFile?.name }}</p>
          <p v-if="attachedFile?.size" class="text-xs text-slate-500">{{ (attachedFile.size / 1024).toFixed(1) }} KB</p>
        </div>

        <button @click="clearAttachment"
          class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <template v-if="!isChatActive">
        <div class="w-full text-center py-5 text-slate-500 text-sm font-medium border-t border-slate-200">
          <span class="mr-2">🔒</span>
          Assuma o chamado para enviar mensagens.
        </div>
      </template>

      <template v-else>
        <div class="flex items-end gap-1 px-4 pt-3 border-t border-slate-200">
          <button @click="isInternalNote = false"
            :class="['px-4 py-2 text-[12px] font-bold rounded-t-xl transition-colors relative z-10 -mb-px', !isInternalNote ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200' : 'text-slate-500 hover:text-slate-700']">
            Mensagem Cliente
          </button>
          <button @click="isInternalNote = true"
            :class="['px-4 py-2 text-[12px] font-bold rounded-t-xl transition-colors flex items-center gap-1.5 relative z-10 -mb-px', isInternalNote ? 'bg-amber-100 text-amber-800 border-t border-l border-r border-amber-300' : 'text-slate-500 hover:text-slate-700']">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Nota Interna
          </button>
        </div>

        <div
          :class="['px-4 py-3 shrink-0 flex items-center gap-2 transition-colors relative z-0', isInternalNote ? 'bg-amber-100 border-t border-amber-300' : 'bg-white border-t border-slate-200']">

          <div class="relative">
            <button @click.stop="isAttachmentMenuOpen = !isAttachmentMenuOpen"
              :class="['w-10 h-10 flex items-center justify-center transition-colors cursor-pointer rounded-full hover:bg-slate-100', isInternalNote ? 'text-amber-600' : 'text-slate-500', isAttachmentMenuOpen ? 'bg-slate-200' : '']">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48">
                </path>
              </svg>
            </button>

            <div v-if="isAttachmentMenuOpen"
              class="absolute bottom-full left-0 mb-3 w-56 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 p-2 flex flex-col gap-1 origin-bottom-left animate-in fade-in zoom-in-95 duration-200">
              <button @click="triggerDocUpload"
                class="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <span class="font-semibold text-slate-700 text-sm">Documento</span>
              </button>
              <button @click="triggerImageUpload"
                class="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                <div
                  class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <span class="font-semibold text-slate-700 text-sm">Fotos e vídeos</span>
              </button>
            </div>
          </div>

          <input type="file" ref="docInput" class="hidden" accept="*" @change="handleFileUpload" />
          <input type="file" ref="imageInput" class="hidden" accept="image/*,video/*" @change="handleFileUpload" />

          <input v-model="text" @keyup.enter="send" @paste="handlePaste"
            :placeholder="isInternalNote ? 'Digite uma nota visível apenas para a equipe...' : 'Digite uma mensagem ou cole um arquivo...'"
            :class="['flex-1 border-none rounded-lg px-4 py-2.5 text-[14px] outline-none shadow-sm transition-all', isInternalNote ? 'bg-amber-200/50 text-amber-900 placeholder:text-amber-700/60 focus:ring-2 focus:ring-amber-400' : 'bg-[#f0f2f5] text-slate-700 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-500']" />

          <button @click="send" :disabled="!text.trim() && !attachedFile"
            :class="['w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm', (text.trim() || attachedFile) ? (isInternalNote ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-blue-600 text-white hover:bg-blue-700') : (isInternalNote ? 'bg-amber-300 text-amber-50 cursor-not-allowed' : 'bg-slate-200 text-white cursor-not-allowed')]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import type { IContact, IMessage } from '../../domain/entities/chat';
import { MessageType, ChatFilter } from '../../domain/valueObjects/chat-enums';
import { useChatStore } from '../store/chat.store';

const props = defineProps<{ contact?: IContact, messages?: IMessage[] }>();

const emit = defineEmits([
  'send',
  'transferir',
  'finalizar',
  'assumir',
  'vincular',
  'abrir-modal-ticket',
  'toggle-profile'
]);

const store = useChatStore();
const text = ref('');
const isInternalNote = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const isAttachmentMenuOpen = ref(false);
const docInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const attachedFile = ref<File | null>(null);
const attachedFileUrl = ref<string | null>(null);

const isChatActive = computed(() => {
  return props.contact?.status === 'in_progress' && store.currentFilter === ChatFilter.CHATS;
});

const isUnsavedContact = computed(() => {
  if (!props.contact) return false;
  return props.contact.name === props.contact.phone || String(props.contact.name).includes('+');
});

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(() => props.messages?.length, () => scrollToBottom());
onMounted(() => scrollToBottom());

const triggerDocUpload = () => {
  isAttachmentMenuOpen.value = false;
  docInput.value?.click();
};

const triggerImageUpload = () => {
  isAttachmentMenuOpen.value = false;
  imageInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    processFile(file);
    target.value = '';
  }
  isAttachmentMenuOpen.value = false;
};

const handlePaste = (event: ClipboardEvent) => {
  const file = event.clipboardData?.files?.[0];
  if (file) {
    processFile(file);
  }
};

const processFile = (file: File) => {
  clearAttachment();
  attachedFile.value = file;
  if (file.type.startsWith('image/')) {
    attachedFileUrl.value = URL.createObjectURL(file);
  }
};

const clearAttachment = () => {
  if (attachedFileUrl.value) {
    URL.revokeObjectURL(attachedFileUrl.value);
  }
  attachedFile.value = null;
  attachedFileUrl.value = null;
};

const send = () => {
  if (text.value.trim() || attachedFile.value) {
    const type = isInternalNote.value ? MessageType.NOTE : MessageType.TEXT;
    emit('send', text.value, type, attachedFile.value || undefined);

    text.value = '';
    clearAttachment();
  }
};
</script>