import { defineStore } from "pinia";
import type { IContact, IMessage } from "../../domain/entities/chat";
import { ChatFilter, MessageType } from "../../domain/valueObjects/chat-enums";
import { chatServices } from "../../data/chat.services";

export const useChatStore = defineStore('chat', {
  state: () => ({
    contacts: [] as IContact[],
    messages: [] as IMessage[],
    selectedContact: null as IContact | null,
    loading: false,
    currentFilter: ChatFilter.ALL
  }),

  getters: {
    filteredContacts: (state) => {
      if (state.currentFilter === ChatFilter.UNREAD) {
        return state.contacts.filter(c => c.unreadCount > 0);
      }
      if (state.currentFilter === ChatFilter.QUEUE) {
        return state.contacts.filter(c => c.status === 'offline');
      }
      return state.contacts;
    }
  },

  actions: {
    async fetchContacts() {
      this.loading = true;
      try {
        this.contacts = await chatServices.getContacts();
      } finally {
        this.loading = false;
      }
    },

    setFilter(filter: ChatFilter) {
      this.currentFilter = filter;
    },

    async selectContact(contact: IContact) {
      this.selectedContact = contact;
      this.loading = true;
      try {
        this.messages = await chatServices.getMessages(contact.id);
        const currentContact = this.contacts.find(c => c.id === contact.id);
        if (currentContact) {
          currentContact.unreadCount = 0;
        }
      } finally {
        this.loading = false;
      }
    },

    transferChat(contactId: string) {
      this.contacts = [...this.contacts.filter(c => c.id !== contactId)];
      this.selectedContact = null;
      this.messages = [];
    },

    sendMessage(text: string) {
      if (!this.selectedContact || !text.trim()) return;
      this.messages.push({
        id: Date.now().toString(),
        text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMine: true,
        type: MessageType.TEXT
      });
    }
  }
});