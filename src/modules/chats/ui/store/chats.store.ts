import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { ChatContact } from "../../domain/entities/ChatContact";
import type { ChatMessage } from "../../domain/entities/ChatMessage";
import { ChatsDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useChatsStore = defineStore("chats", () => {
  // 1. Injeção de Dependência Limpa
  const getContactsUseCase = inject(ChatsDI.GetContacts)!;
  const getMessagesUseCase = inject(ChatsDI.GetMessages)!;
  const sendMessageUseCase = inject(ChatsDI.SendMessage)!;

  // 2. Utilitário de feedback visual
  const { showToast } = useToast();

  // 3. Estado
  const contacts = ref<ChatContact[]>([]);
  const messages = ref<ChatMessage[]>([]);
  const activeChatId = ref<number | null>(null);
  const activeFilter = ref<"all" | "unread" | "queue">("all");
  const loading = ref(false);

  // 4. Getters
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

  // 5. Actions com Tratamento de Erro (Clean Code)
  const loadContacts = async () => {
    loading.value = true;
    try {
      contacts.value = await getContactsUseCase.execute();
      
      const firstContact = contacts.value[0];
      if (firstContact && !activeChatId.value) {
        await setActiveChat(firstContact.id);
      }
    } catch (error) {
      console.error("[ChatsStore] Erro ao carregar contatos:", error);
      showToast("Falha ao carregar as conversas. Verifique sua conexão.", "error");
    } finally {
      loading.value = false;
    }
  };

  const setActiveChat = async (id: number) => {
    try {
      activeChatId.value = id;
      messages.value = await getMessagesUseCase.execute(id);
      
      const contact = contacts.value.find((c) => c.id === id);
      if (contact) {
        contact.unread = 0;
      }
    } catch (error) {
      console.error("[ChatsStore] Erro ao carregar mensagens:", error);
      showToast("Não foi possível carregar as mensagens deste contato.", "error");
    }
  };

  const sendMessage = async (text: string, isNote: boolean) => {
    if (!activeChatId.value) return;
    
    try {
      const type = isNote ? "note" : "text";
      const newMsg = await sendMessageUseCase.execute(activeChatId.value, text, type);
      
      messages.value.push(newMsg);
      
      const contact = contacts.value.find((c) => c.id === activeChatId.value);
      if (contact && !isNote) {
        contact.lastMessage = text;
        contact.time = newMsg.time;
      }
    } catch (error) {
      console.error("[ChatsStore] Erro ao enviar mensagem:", error);
      showToast("Falha ao enviar a mensagem. Tente novamente.", "error");
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