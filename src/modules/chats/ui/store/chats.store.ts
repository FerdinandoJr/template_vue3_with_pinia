import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ChatContact } from "../../domain/entities/ChatContact";
import type { ChatMessage } from "../../domain/entities/ChatMessage";
import { getContactsUseCase, getMessagesUseCase, sendMessageUseCase } from "../../di";

export const useChatsStore = defineStore("chats", () => {
  const contacts = ref<ChatContact[]>([]);
  const messages = ref<ChatMessage[]>([]);
  const activeChatId = ref<number | null>(null);
  const activeFilter = ref<"all" | "unread" | "queue">("all");
  const loading = ref(false);
  const activeChat = computed(() =>
    contacts.value.find((c) => c.id === activeChatId.value),
  );

  const filteredContacts = computed(() => {
    if (activeFilter.value === "unread") {
      return contacts.value.filter((c) => c.unread > 0);
    }
    if (activeFilter.value === "queue") {
      return contacts.value.filter((c) => c.status === "pending");
    }
    return contacts.value;
  });

  const loadContacts = async () => {
    loading.value = true;
    contacts.value = await getContactsUseCase.execute();
    
    const firstContact = contacts.value[0];
    if (firstContact && !activeChatId.value) {
      setActiveChat(firstContact.id);
    }
    
    loading.value = false;
  };

  const setActiveChat = async (id: number) => {
    activeChatId.value = id;
    messages.value = await getMessagesUseCase.execute(id);
    
    const contact = contacts.value.find((c) => c.id === id);
    if (contact) {
      contact.unread = 0;
    }
  };

  const sendMessage = async (text: string, isNote: boolean) => {
    if (!activeChatId.value) return;
    
    const type = isNote ? "note" : "text";
    const newMsg = await sendMessageUseCase.execute(activeChatId.value, text, type);
    
    messages.value.push(newMsg);
    
    const contact = contacts.value.find((c) => c.id === activeChatId.value);
    if (contact && !isNote) {
      contact.lastMessage = text;
      contact.time = newMsg.time;
    }
  };

  return {
    contacts,
    messages,
    activeChatId,
    activeChat,
    filteredContacts,
    activeFilter,
    loading,
    loadContacts,
    setActiveChat,
    sendMessage,
  };
});