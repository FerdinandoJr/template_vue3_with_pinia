<template>
  <div class="flex h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden m-4">
    <ContactList 
      :selectedId="selectedContact?.id" 
      @select="store.selectContact" 
    />

    <template v-if="selectedContact">
      <ChatArea 
        :contact="selectedContact" 
        :messages="messages" 
        @send="store.sendMessage"
        @transfer="handleTransfer"
      />
      <ChatProfile :contact="selectedContact" />
    </template>

    <div v-else class="flex-1 flex flex-col items-center justify-center bg-[#f8fafd]">
      <span class="text-[80px] mb-4 opacity-10">💬</span>
      <span class="text-slate-400 font-black uppercase text-[11px] tracking-[0.3em]">
        Selecione uma conversa ao lado
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../store/chat.store';

import ContactList from '../components/ContactList.vue';
import ChatArea from '../components/ChatArea.vue';
import ChatProfile from '../components/ChatProfile.vue';

const store = useChatStore();
const { messages, selectedContact } = storeToRefs(store);

onMounted(() => {
  store.fetchContacts();
});

const handleTransfer = (contactId: string) => {
  if (confirm('Deseja transferir este atendimento?')) {
    store.transferChat(contactId);
  }
};
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>