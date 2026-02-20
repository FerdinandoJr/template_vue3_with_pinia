<template>
  <div class="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <ChatList 
        :contacts="filteredContacts"
        :active-chat-id="activeChatId"
        v-model:filter="store.activeFilter"
        @select="store.setActiveChat"
    />

    <ChatWindow 
        :active-chat="activeChat"
        :messages="messages"
        @send="store.sendMessage"
        @toggle-sidebar="showRightSidebar = !showRightSidebar"
    />

    <ContactDetails 
        v-if="showRightSidebar && activeChat" 
        :chat="activeChat"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatsStore } from '../store/chats.store';
import ChatList from '../components/ChatList.vue';
import ChatWindow from '../components/ChatWindow.vue';
import ContactDetails from '../components/ContactDetails.vue';

const store = useChatsStore();
const { filteredContacts, activeChatId, activeChat, messages } = storeToRefs(store);

// Estado de UI
const showRightSidebar = ref(true);

onMounted(() => {
    store.loadContacts();
});
</script>