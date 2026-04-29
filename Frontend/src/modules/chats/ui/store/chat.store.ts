import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IContact, IMessage } from '../../data/chat.services';
import { ChatFilter, ChatSortOption, MessageType } from '../../domain/valueObjects/chat-enums';
import type { SendMessageDTO } from '../../domain/dto/chat.dto';
import { getTimeWeight } from '../../../../utils/helpers';
import { chatServices } from '../../data/chat.services';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { ElNotification } from 'element-plus';
import { h } from 'vue';

export const useChatStore = defineStore('chat', () => {
  const activeContactId = ref<string | null>(null);
  const currentFilter = ref<ChatFilter>(ChatFilter.CHATS);
  const currentSort = ref<ChatSortOption>(ChatSortOption.NEWEST);
  const searchTerm = ref('');
  const loading = ref(false);
  const currentUser = ref({ id: 'agent_1', name: 'Você' });

  const replyingTo = ref<IMessage | null>(null);

  const contacts = ref<IContact[]>([]);
  const messagesDb = ref<Record<string, IMessage[]>>({});

  const filteredContacts = computed(() => {
    let list = contacts.value.filter(c => {
      if (currentFilter.value === ChatFilter.CHATS) return c.status === 'in_progress';
      if (currentFilter.value === ChatFilter.FILA) return c.status === 'queued';
      return true;
    });

    if (searchTerm.value) {
      const lower = searchTerm.value.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(lower) || c.phone.includes(lower));
    }

    const sortedList = [...list];
    switch (currentSort.value) {
      case ChatSortOption.NEWEST: sortedList.sort((a, b) => getTimeWeight(b.lastMessageTime) - getTimeWeight(a.lastMessageTime)); break;
      case ChatSortOption.OLDEST: sortedList.sort((a, b) => getTimeWeight(a.lastMessageTime) - getTimeWeight(b.lastMessageTime)); break;
      case ChatSortOption.LONGEST_WAIT: case ChatSortOption.SHORTEST_WAIT: sortedList.sort((a, b) => currentSort.value === ChatSortOption.LONGEST_WAIT ? getTimeWeight(a.lastMessageTime) - getTimeWeight(b.lastMessageTime) : getTimeWeight(b.lastMessageTime) - getTimeWeight(a.lastMessageTime)); break;
      default: sortedList.sort((a, b) => getTimeWeight(b.lastMessageTime) - getTimeWeight(a.lastMessageTime));
    }
    return sortedList;
  });

  const selectedContact = computed(() => contacts.value.find(c => c.id === activeContactId.value) || null);
  const messages = computed(() => activeContactId.value ? (messagesDb.value[activeContactId.value] || []) : []);
  const filaCount = computed(() => contacts.value.filter(c => c.status === 'queued').length);

  function setReplyingTo(msg: IMessage) { replyingTo.value = msg; }
  function clearReplyingTo() { replyingTo.value = null; }

  async function fetchChats() {
    loading.value = true;
    try {
      const data = await chatServices.getChats();
      contacts.value = data || [];
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchQueueCount() {
    try {
      const count = await chatServices.getQueueCount();
      return count || 0;
    } catch (error) {
      console.error('Erro ao carregar contagem da fila:', error);
      return 0;
    }
  }

  async function fetchMessages(contactId: string) {
    try {
      const data = await chatServices.getMessages(contactId);
      messagesDb.value[contactId] = data || [];
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }

  function selectContact(contact: IContact) {
    const now = Date.now();
    if (activeContactId.value && activeContactId.value !== contact.id) {
      const previous = contacts.value.find(c => c.id === activeContactId.value);
      if (previous && previous.lastActiveAt) {
        previous.accumulatedTime = (previous.accumulatedTime || 0) + (now - previous.lastActiveAt);
        previous.lastActiveAt = null;
      }
    }
    activeContactId.value = contact.id;
    clearReplyingTo();

    const current = contacts.value.find(c => c.id === contact.id);
    if (current && current.status === 'in_progress') {
      current.unreadCount = 0;
      current.lastActiveAt = now;
      if (current.accumulatedTime === undefined) current.accumulatedTime = 0;
    }

    fetchMessages(contact.id);
  }

  async function sendMessage(dto: SendMessageDTO) {
    const { contactId, text, type, file } = dto;
    if (!contactId) return;

    const localFileUrl = file ? URL.createObjectURL(file) : undefined;

    const newMessage: IMessage = {
      id: crypto.randomUUID(),
      text: file ? file.name : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      type: type,
      fileUrl: localFileUrl,
      fileName: file?.name,
      replyTo: replyingTo.value ? { ...replyingTo.value } : undefined,
      status: 'sending'
    };

    let msgs = messagesDb.value[contactId];
    if (!msgs) {
      msgs = [];
      messagesDb.value[contactId] = msgs;
    }
    msgs.push(newMessage);

    const contact = contacts.value.find(c => c.id === contactId);
    if (contact) {
      if (type === MessageType.AUDIO) contact.lastMessage = '🎵 Áudio';
      else if (type === MessageType.NOTE) contact.lastMessage = '📝 Nota interna';
      else if (file) contact.lastMessage = '📁 Arquivo anexado';
      else contact.lastMessage = text;
      contact.lastMessageTime = 'Agora';
    }

    clearReplyingTo();

    try {
      await chatServices.sendMessage(contactId, currentUser.value.id, 'agent', text);
      newMessage.status = 'sent';
    } catch (error) {
      newMessage.status = 'error';
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  function retryMessage(contactId: string | null, messageId: string) {
    if (!contactId) return;

    const msgList = messagesDb.value[contactId];
    if (!msgList) return;

    const msg = msgList.find(m => m.id === messageId);
    if (msg) {
      msg.status = 'sending';

      chatServices.sendMessage(contactId, currentUser.value.id, 'agent', msg.text)
        .then(() => {
          msg.status = 'sent';
        })
        .catch(() => {
          msg.status = 'error';
        });
    }
  }

  async function assumirChat(contactId: string) {
    const contact = contacts.value.find(c => c.id === contactId);
    if (contact) {
      const newServiceId = crypto.randomUUID();
      contact.status = 'in_progress';
      contact.serviceId = newServiceId;
      contact.agentId = currentUser.value.id;
      contact.accumulatedTime = 0;
      contact.serviceStartedAt = Date.now();
      if (activeContactId.value === contactId) contact.lastActiveAt = Date.now();

      let msgs = messagesDb.value[contactId];
      if (!msgs) {
        msgs = [];
        messagesDb.value[contactId] = msgs;
      }
      msgs.push({ id: crypto.randomUUID(), text: `Atendimento iniciado. Protocolo: #${newServiceId}`, timestamp: 'Agora', isMine: true, type: MessageType.ALERT });

      currentFilter.value = ChatFilter.CHATS;
      selectContact(contact);
      return newServiceId;
    }
    return null;
  }

  async function finalizarChat(contactOrServiceId: string, reason?: string, description?: string) {
    const idx = contacts.value.findIndex(c => c.id === contactOrServiceId || c.serviceId === contactOrServiceId);

    if (idx !== -1) {
      const contact = contacts.value[idx];
      if (!contact) return;

      const now = Date.now();
      if (contact.lastActiveAt) {
        contact.accumulatedTime = (contact.accumulatedTime || 0) + (now - contact.lastActiveAt);
        contact.lastActiveAt = null;
      }

      contact.status = 'finished';
      (contact as any).finishReason = reason;
      (contact as any).finishDescription = description;
      (contact as any).finishedAt = new Date();

      try {
        await chatServices.closeChat(contact.id);
      } catch (error) {
        console.error('Erro ao fechar chat:', error);
      }

      let msgs = messagesDb.value[contact.id];
      if (!msgs) {
        msgs = [];
        messagesDb.value[contact.id] = msgs;
      }

      msgs.push({
        id: crypto.randomUUID(),
        text: `🔒 Atendimento encerrado${reason ? '. Resolução: ' + reason : ' via painel de Atendimentos.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
        type: MessageType.ALERT
      });

      contact.lastMessage = 'Atendimento encerrado.';
      contact.lastMessageTime = 'Agora';

      if (activeContactId.value === contact.id) activeContactId.value = null;
    }
  }

  const finishChat = finalizarChat;

  async function transferirChat(contactId: string, destination?: string) {
    const idx = contacts.value.findIndex(c => c.id === contactId);
    if (idx !== -1) {
      const msgs = messagesDb.value[contactId];
      if (msgs) {
        msgs.push({ id: crypto.randomUUID(), text: `Transferido para: ${destination || 'Outro departamento'}`, timestamp: 'Agora', isMine: true, type: MessageType.ALERT });
      }

      contacts.value.splice(idx, 1);
      if (activeContactId.value === contactId) activeContactId.value = null;
    }
  }

  function updateContact(id: string, updates: Partial<IContact>) {
    const contact = contacts.value.find(c => c.id === id);
    if (contact) Object.assign(contact, updates);
  }

  function linkCustomerToChat(contactId: string, customerData: { id: string, name: string, company?: string }) {
    const contact = contacts.value.find(c => c.id === contactId);
    if (contact) {
      contact.customerId = customerData.id;
      contact.name = customerData.name;
      if (customerData.company) contact.company = customerData.company;
    }
  }

  function setFilter(f: ChatFilter) { currentFilter.value = f; activeContactId.value = null; }
  function setSearchQuery(q: string) { searchTerm.value = q; }

  let slaInterval: any = null;

  function initSlaMonitor() {
    if (slaInterval) clearInterval(slaInterval);

    slaInterval = setInterval(() => {
      const authStore = useAuthStore();
      const userRole = authStore.user?.role;
      if (userRole !== 'ADMIN' && userRole !== 'MANAGER') return;

      const now = Date.now();
      const QUEUE_LIMIT = 15 * 60 * 1000;
      const SERVICE_LIMIT = 30 * 60 * 1000;

      contacts.value.forEach(contact => {
        if (contact.status === 'queued' && contact.createdAt && !contact.slaNotifiedQueued) {
          if (now - contact.createdAt > QUEUE_LIMIT) {
            contact.slaNotifiedQueued = true;
            ElNotification({
              title: 'Alerta de Fila',
              message: h('div', { class: 'mt-1 text-sm text-slate-600' }, [
                h('strong', { class: 'text-red-600' }, contact.name),
                ` está aguardando na fila há mais de 15 minutos.`
              ]),
              type: 'error',
              duration: 10000,
            });
          }
        }

        if (contact.status === 'in_progress' && contact.serviceStartedAt && !contact.slaNotifiedService) {
          if (now - contact.serviceStartedAt > SERVICE_LIMIT) {
            contact.slaNotifiedService = true;
            ElNotification({
              title: 'Alerta de Atendimento',
              message: h('div', { class: 'mt-1 text-sm text-slate-600' }, [
                `O atendimento de `,
                h('strong', { class: 'text-amber-600' }, contact.name),
                ` já dura mais de 30 minutos.`
              ]),
              type: 'warning',
              duration: 10000,
            });
          }
        }
      });
    }, 5000);
  }

  return {
    contacts, activeContactId, currentFilter, currentSort, messages, selectedContact, filteredContacts, filaCount, currentUser, replyingTo,
    setFilter, selectContact, setSearchQuery, sendMessage, assumirChat, finalizarChat, transferirChat, updateContact, linkCustomerToChat, setReplyingTo, clearReplyingTo,
    retryMessage,
    finishChat,
    initSlaMonitor,
    fetchChats,
    fetchQueueCount
  };
});