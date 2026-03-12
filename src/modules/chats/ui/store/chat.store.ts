import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IContact, IMessage } from '../../domain/entities/chat';
import { ChatFilter, ChatSortOption, MessageType, ChatChannel } from '../../domain/valueObjects/chat-enums';
import type { SendMessageDTO } from '../../domain/dto/chat.dto';
import { generateUUIDv7, getTimeWeight } from '../../../../util/helpers';

export const useChatStore = defineStore('chat', () => {
  const activeContactId = ref<string | null>(null);
  const currentFilter = ref<ChatFilter>(ChatFilter.CHATS);
  const currentSort = ref<ChatSortOption>(ChatSortOption.NEWEST);
  const searchTerm = ref('');
  const currentUser = ref({ id: 'agent_1', name: 'Você' });

  const replyingTo = ref<IMessage | null>(null);

  const contacts = ref<IContact[]>([
    { id: '1', name: 'Fernanda Lima', company: 'Tech Solutions', avatar: 'https://i.pravatar.cc/150?u=fernanda', channel: ChatChannel.WHATSAPP, lastMessage: 'Pode confirmar o recebimento?', lastMessageTime: '10:42', status: 'in_progress', serviceId: generateUUIDv7(), agentId: 'agent_1', customerId: 'cust_55', unreadCount: 1, email: 'fernanda@tech.com', phone: '(11) 99999-8888', tags: ['Financeiro', 'VIP'] },
    { id: '2', name: 'Roberto Carlos', company: 'Logística S.A', avatar: 'https://i.pravatar.cc/150?u=roberto', channel: ChatChannel.WHATSAPP, lastMessage: 'Obrigado pelo suporte!', lastMessageTime: '09:15', status: 'in_progress', serviceId: generateUUIDv7(), agentId: 'agent_1', customerId: 'cust_102', unreadCount: 0, email: 'roberto@log.com', phone: '(11) 97777-6666', tags: ['Suporte'] },
    { id: '3', name: 'Amanda Silva', company: 'E-commerce Brasil', avatar: 'https://i.pravatar.cc/150?u=amanda', channel: ChatChannel.WHATSAPP, lastMessage: 'Qual o prazo de entrega?', lastMessageTime: 'Ontem', status: 'queued', serviceId: null, agentId: null, customerId: null, unreadCount: 0, email: 'amanda@eco.com', phone: '(11) 98888-7777', tags: ['Dúvida'] },
    { id: 'novo-numero-123', name: '+55 (47) 99123-4567', company: '', phone: '+55 (47) 99123-4567', avatar: '', status: 'queued', channel: ChatChannel.WHATSAPP, lastMessage: 'Olá, gostaria de um orçamento', lastMessageTime: '09:00', serviceId: null, agentId: null, customerId: null, unreadCount: 1, email: '', tags: [] }
  ]);

  const messagesDb = ref<Record<string, IMessage[]>>({
    '1': [
      { id: generateUUIDv7(), text: 'Bom dia.', timestamp: '09:55', isMine: false, type: MessageType.TEXT },
      { id: generateUUIDv7(), text: 'Olá Fernanda!', timestamp: '10:00', isMine: true, type: MessageType.TEXT, status: 'delivered' },
      { id: generateUUIDv7(), text: 'Pode confirmar o recebimento?', timestamp: '10:42', isMine: false, type: MessageType.TEXT }
    ]
  });

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
  }

  function sendMessage(dto: SendMessageDTO) {
    const { contactId, text, type, file } = dto;
    if (!contactId) return;

    const localFileUrl = file ? URL.createObjectURL(file) : undefined;
    const newMsgId = generateUUIDv7();

    const isSimulatingError = text.toLowerCase().includes('falha');

    const newMessage: IMessage = {
      id: newMsgId,
      text: file ? file.name : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      type: type,
      fileUrl: localFileUrl,
      fileName: file?.name,
      replyTo: replyingTo.value ? { ...replyingTo.value } : undefined,
      status: isSimulatingError ? 'error' : 'sent'
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

    if (!isSimulatingError && type !== MessageType.NOTE) {
      setTimeout(() => {
        const msg = messagesDb.value[contactId]?.find(m => m.id === newMsgId);
        if (msg && msg.status === 'sent') msg.status = 'delivered';
      }, 1200);
    }
  }

  function retryMessage(contactId: string | null, messageId: string) {
    if (!contactId) return;

    const msgList = messagesDb.value[contactId];
    if (!msgList) return;

    const msg = msgList.find(m => m.id === messageId);
    if (msg) {
      msg.status = 'sent';

      setTimeout(() => {
        msg.status = 'delivered';
      }, 1500);
    }
  }

  function assumirChat(contactId: string) {
    const contact = contacts.value.find(c => c.id === contactId);
    if (contact) {
      const newServiceId = generateUUIDv7();
      contact.status = 'in_progress';
      contact.serviceId = newServiceId;
      contact.agentId = currentUser.value.id;
      contact.accumulatedTime = 0;
      if (activeContactId.value === contactId) contact.lastActiveAt = Date.now();

      let msgs = messagesDb.value[contactId];
      if (!msgs) {
        msgs = [];
        messagesDb.value[contactId] = msgs;
      }
      msgs.push({ id: generateUUIDv7(), text: `Atendimento iniciado. Protocolo: #${newServiceId}`, timestamp: 'Agora', isMine: true, type: MessageType.ALERT });

      currentFilter.value = ChatFilter.CHATS;
      selectContact(contact);
      return newServiceId;
    }
    return null;
  }

  function finalizarChat(contactOrServiceId: string, reason?: string) {
    const idx = contacts.value.findIndex(c => c.id === contactOrServiceId || c.serviceId === contactOrServiceId);

    if (idx !== -1) {
      const contact = contacts.value[idx];
      if (!contact) return;

      const now = Date.now();
      if (contact.lastActiveAt) {
        contact.accumulatedTime = (contact.accumulatedTime || 0) + (now - contact.lastActiveAt);
        contact.lastActiveAt = null;
      }

      (contact as any).status = 'finished';

      let msgs = messagesDb.value[contact.id];
      if (!msgs) {
        msgs = [];
        messagesDb.value[contact.id] = msgs;
      }

      msgs.push({
        id: generateUUIDv7(),
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

  function transferirChat(contactId: string, destination?: string) {
    const idx = contacts.value.findIndex(c => c.id === contactId);
    if (idx !== -1) {
      const msgs = messagesDb.value[contactId];
      if (msgs) {
        msgs.push({ id: generateUUIDv7(), text: `Transferido para: ${destination || 'Outro departamento'}`, timestamp: 'Agora', isMine: true, type: MessageType.ALERT });
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

  return {
    contacts, activeContactId, currentFilter, currentSort, messages, selectedContact, filteredContacts, filaCount, currentUser, replyingTo,
    setFilter, selectContact, setSearchQuery, sendMessage, assumirChat, finalizarChat, transferirChat, updateContact, linkCustomerToChat, setReplyingTo, clearReplyingTo,
    retryMessage,
    finishChat
  };
});