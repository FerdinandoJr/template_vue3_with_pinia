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
    currentSort: ChatSortOption.LONGEST_WAIT as string | ChatSortOption
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
        return result.sort((a, b) => {
          const nameA = a.name || "";
          const nameB = b.name || "";
          return nameA.localeCompare(nameB);
        });
      }

      const parseTime = (timeStr?: string) => {
        if (!timeStr) return 0;

        const lower = timeStr.trim().toLowerCase();

        if (lower.includes('ontem')) {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          d.setHours(12, 0, 0, 0);
          return d.getTime();
        }

        const timeMatch = lower.match(/(\d{1,2})[:h](\d{2})/);
        if (timeMatch) {
          const hh = parseInt(timeMatch[1] || '0', 10);
          const mm = parseInt(timeMatch[2] || '0', 10);
          const d = new Date();
          d.setHours(hh, mm, 0, 0);
          return d.getTime();
        }

        const parsed = Date.parse(timeStr);
        return isNaN(parsed) ? 0 : parsed;
      };

      const sortStr = String(state.currentSort).toLowerCase();
      const isMenorTempo = sortStr.includes('menor') || sortStr.includes('shortest') || sortStr.includes('new');

      result.sort((a, b) => {
        const timeA = parseTime(a.lastMessageTime);
        const timeB = parseTime(b.lastMessageTime);

        if (timeA === timeB) return 0;

        if (isMenorTempo) {
          return timeB - timeA;
        } else {
          return timeA - timeB;
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

      if (target) {
        this.selectedContact = target;
      } else {
        this.selectedContact = contact;
      }

      this.loading = true;
      try {
        this.messages = await chatServices.getMessages(contact.id);
        const index = this.contacts.findIndex(c => c.id === contact.id);
        if (index !== -1 && this.contacts[index]) {
          const current = this.contacts[index];
          if (current) current.unreadCount = 0;
        }
      } finally {
        this.loading = false;
      }
    },

    assumirChat(contactId: string) {
      const targetContact = this.contacts.find(c => c.id === contactId);

      if (targetContact) {
        const protocol = 'ATD-' + Date.now().toString();

        targetContact.status = 'in_progress';
        targetContact.currentAtendimentoId = protocol;

        if (this.selectedContact && this.selectedContact.id === contactId) {
          this.selectedContact.status = 'in_progress';
          this.selectedContact.currentAtendimentoId = protocol;
        }

        this.contacts = [...this.contacts];
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
      const targetContact = this.contacts.find(c => c.id === contactId);

      if (!targetContact) return;

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
          atendimentoId: targetContact.currentAtendimentoId
        });

        fullDescription += fileNames;
      }

      this.messages.push({
        id: (Date.now() + 1).toString(),
        text: `Atendimento finalizado. Pesquisa de satisfação (CSAT) enviada ao cliente.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
        type: MessageType.ALERT,
        atendimentoId: targetContact.currentAtendimentoId
      });

      serviceStore.registerFinish({
        companyName: targetContact.company || targetContact.name,
        cnpj: 'N/A',
        reason: 'Atendimento WhatsApp',
        description: fullDescription,
        duration: '15m'
      });

      targetContact.status = 'finished';
      targetContact.currentAtendimentoId = undefined;

      if (this.selectedContact && this.selectedContact.id === contactId) {
        this.selectedContact.status = 'finished';
        this.selectedContact.currentAtendimentoId = undefined;
      }

      this.contacts = [...this.contacts];

      setTimeout(() => {
        if (this.selectedContact?.id === contactId) {
          this.selectedContact = null;
          this.messages = [];
        }
      }, 2500);
    },

    transferirChat(contactId: string) {
      const targetContact = this.contacts.find(c => c.id === contactId);

      if (targetContact) {
        targetContact.status = 'waiting';
        this.contacts = [...this.contacts];
        this.currentFilter = ChatFilter.FILA;
      }

      if (this.selectedContact && this.selectedContact.id === contactId) {
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

      const targetContact = this.contacts.find(c => c.id === this.selectedContact?.id);

      if (targetContact) {
        targetContact.lastMessage = type === MessageType.NOTE ? `🔒 Nota interna` : (file && !text ? '📎 Arquivo anexado' : text);
        targetContact.lastMessageTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        this.contacts = [...this.contacts];
      }
    },

    updateContact(contactId: string, updatedData: Partial<IContact>) {
      const targetContact = this.contacts.find(c => c.id === contactId);

      if (targetContact) {
        Object.assign(targetContact, updatedData);

        if (this.selectedContact && this.selectedContact.id === contactId) {
          Object.assign(this.selectedContact, updatedData);
        }

        this.contacts = [...this.contacts];
      }
    }
  }
});