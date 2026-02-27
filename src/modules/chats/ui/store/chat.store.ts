import { defineStore } from "pinia";
import type { IContact, IMessage } from "../../domain/entities/chat";
import { ChatFilter, ChatSortOption, MessageType, ChatChannel } from "../../domain/valueObjects/chat-enums";
import { chatServices } from "../../data/chat.services";
import { useServiceStore } from "@/modules/service/ui/store/service.store";

export const useChatStore = defineStore('chat', {
  state: () => ({
    contacts: [] as IContact[],
    messages: [] as IMessage[],
    selectedContact: null as IContact | null,
    loading: false,
    currentFilter: ChatFilter.CHATS,
    currentSort: ChatSortOption.LONGEST_WAIT
  }),

  getters: {
    filaCount: (state) => state.contacts.filter(c => c.status === 'waiting').length,

    filteredContacts: (state) => {
      let result = [...state.contacts];

      if (state.currentFilter === ChatFilter.CHATS) {
        result = result.filter(c => c.status === 'in_progress');
      } else if (state.currentFilter === ChatFilter.FILA) {
        result = result.filter(c => c.status === 'waiting');
      } else {
        return result.sort((a, b) => a.name.localeCompare(b.name));
      }

      result.sort((a, b) => {
        const timeA = a.lastMessageTime || "";
        const timeB = b.lastMessageTime || "";

        switch (state.currentSort) {
          case ChatSortOption.NEWEST:
          case ChatSortOption.SHORTEST_WAIT:
            return timeB.localeCompare(timeA);
          case ChatSortOption.OLDEST:
          case ChatSortOption.LONGEST_WAIT:
          default:
            return timeA.localeCompare(timeB);
        }
      });

      return result;
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
      const target = this.contacts.find(c => c.id === contact.id);
      this.selectedContact = target || contact;

      this.loading = true;
      try {
        this.messages = await chatServices.getMessages(contact.id);
        if (target) {
          target.unreadCount = 0;
        }
      } finally {
        this.loading = false;
      }
    },

    assumirChat(contactId: string) {
      const contact = this.contacts.find(c => c.id === contactId);

      if (contact) {
        contact.status = 'in_progress';

        const protocol = 'ATD-' + Date.now().toString();
        contact.currentAtendimentoId = protocol;

        if (this.selectedContact?.id === contactId) {
          this.selectedContact.status = 'in_progress';
          this.selectedContact.currentAtendimentoId = protocol;
        }

        // MUDA A ABA PARA CHATS AUTOMATICAMENTE
        this.currentFilter = ChatFilter.CHATS;

        this.messages.push({
          id: Date.now().toString(),
          text: `Você assumiu este atendimento. Protocolo: ${protocol}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isMine: false,
          type: MessageType.ALERT,
          atendimentoId: protocol
        });
      }
    },

    finalizarChat(contactId: string, summaryData?: { description: string, files: File[] }) {
      const serviceStore = useServiceStore();
      const contact = this.contacts.find(c => c.id === contactId);

      if (!contact) return;

      let fullDescription = summaryData?.description || 'Atendimento finalizado via Chat.';

      if (summaryData && summaryData.description) {
        const fileNames = summaryData.files.length > 0
          ? `\n📎 Anexos: ${summaryData.files.map(f => f.name).join(', ')}`
          : '';

        this.messages.push({
          id: Date.now().toString(),
          text: `📝 Resumo do Atendimento:\n${summaryData.description}${fileNames}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isMine: true,
          type: MessageType.ALERT,
          atendimentoId: contact.currentAtendimentoId
        });

        fullDescription += fileNames;
      }

      this.messages.push({
        id: (Date.now() + 1).toString(),
        text: `Atendimento finalizado. Pesquisa de satisfação (CSAT) enviada ao cliente.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
        type: MessageType.ALERT,
        atendimentoId: contact.currentAtendimentoId
      });

      serviceStore.registerFinish({
        companyName: contact.company || contact.name,
        cnpj: 'N/A',
        reason: 'Atendimento WhatsApp',
        description: fullDescription,
        duration: '15m'
      });

      contact.status = 'finished';
      contact.currentAtendimentoId = undefined;

      if (this.selectedContact?.id === contactId) {
        this.selectedContact.status = 'finished';
        this.selectedContact.currentAtendimentoId = undefined;
      }

      setTimeout(() => {
        if (this.selectedContact?.id === contactId) {
          this.selectedContact = null;
          this.messages = [];
        }
      }, 2500);
    },

    transferirChat(contactId: string) {
      const contact = this.contacts.find(c => c.id === contactId);
      if (contact) {
        contact.status = 'waiting';
        this.currentFilter = ChatFilter.FILA;
      }

      if (this.selectedContact?.id === contactId) {
        this.selectedContact.status = 'waiting';
      }

      this.selectedContact = null;
      this.messages = [];
    },

    sendMessage(text: string, type: MessageType = MessageType.TEXT, file?: File) {
      if (!this.selectedContact || (!text.trim() && !file)) return;

      let finalMessage = text;

      if (file) {
        const fileTag = `📎 Anexo: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        finalMessage = text ? `${text}\n\n${fileTag}` : fileTag;
      }

      this.messages.push({
        id: Date.now().toString(),
        text: finalMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMine: true,
        type: type,
        atendimentoId: this.selectedContact.currentAtendimentoId
      });

      const currentContact = this.contacts.find(c => c.id === this.selectedContact?.id);
      if (currentContact) {
        currentContact.lastMessage = type === MessageType.NOTE ? `🔒 Nota interna` : (file && !text ? '📎 Arquivo anexado' : text);
        currentContact.lastMessageTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
    },

    updateContact(contactId: string, updatedData: Partial<IContact>) {
      const contact = this.contacts.find(c => c.id === contactId);
      if (contact) {
        Object.assign(contact, updatedData);
        if (this.selectedContact?.id === contactId) {
          Object.assign(this.selectedContact, updatedData);
        }
      }
    }
  }
});