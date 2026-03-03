import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IContact, IMessage } from '../../domain/entities/chat';
import { ChatFilter, ChatSortOption, MessageType, ChatChannel } from '../../domain/valueObjects/chat-enums';

// --- HELPER: UUID v7 GENERATOR ---
const generateUUIDv7 = (): string => {
  const now = Date.now();
  const value = new Uint8Array(16);
  crypto.getRandomValues(value);

  value[0] = (now >> 40) & 0xff;
  value[1] = (now >> 32) & 0xff;
  value[2] = (now >> 24) & 0xff;
  value[3] = (now >> 16) & 0xff;
  value[4] = (now >> 8) & 0xff;
  value[5] = now & 0xff;

  value[6] = ((value[6] ?? 0) & 0x0f) | 0x70;
  value[8] = ((value[8] ?? 0) & 0x3f) | 0x80;

  return [...value].map((b) => b.toString(16).padStart(2, '0')).join('')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
};

// --- HELPER: TIME PARSER ---
const getTimeWeight = (timeStr: string): number => {
  if (!timeStr) return 0;
  const t = timeStr.toLowerCase().trim();

  // Palavras-chave do mock
  if (t === 'agora') return Date.now() + 1000; // +1s para garantir topo
  if (t === 'ontem') return Date.now() - 86400000; // 24h atrás

  // Formato HH:mm (assume data de hoje)
  if (t.includes(':') && !t.includes('/')) {
    const parts = t.split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
  }

  // Formato DD/MM/YYYY (Data completa)
  if (t.includes('/')) {
    const parts = t.split('/').map(Number);
    const day = parts[0] ?? 1;
    const month = (parts[1] ?? 1) - 1; // Mês 0-indexado
    const year = parts[2] ?? new Date().getFullYear();
    const d = new Date(year, month, day);
    return d.getTime();
  }

  return 0;
};

export const useChatStore = defineStore('chat', () => {

  // --- STATE ---
  const activeContactId = ref<string | null>(null);
  const currentFilter = ref<ChatFilter>(ChatFilter.CHATS);
  const currentSort = ref<ChatSortOption>(ChatSortOption.NEWEST);
  const searchTerm = ref('');
  const currentUser = ref({ id: 'agent_1', name: 'Você' });

  // --- MOCK DATA ---
  const contacts = ref<IContact[]>([
    {
      id: '1',
      name: 'Fernanda Lima',
      company: 'Tech Solutions',
      avatar: 'https://i.pravatar.cc/150?u=fernanda',
      channel: ChatChannel.WHATSAPP,
      lastMessage: 'Pode confirmar o recebimento?',
      lastMessageTime: '10:42',
      status: 'in_progress',
      serviceId: generateUUIDv7(),
      agentId: 'agent_1',
      customerId: 'cust_55',
      unreadCount: 1,
      email: 'fernanda@tech.com',
      phone: '(11) 99999-8888',
      tags: ['Financeiro', 'VIP']
    },
    {
      id: '2',
      name: 'Roberto Carlos',
      company: 'Logística S.A',
      avatar: 'https://i.pravatar.cc/150?u=roberto',
      channel: ChatChannel.WHATSAPP,
      lastMessage: 'Obrigado pelo suporte!',
      lastMessageTime: '09:15',
      status: 'in_progress',
      serviceId: generateUUIDv7(),
      agentId: 'agent_1',
      customerId: 'cust_102',
      unreadCount: 0,
      email: 'roberto@log.com',
      phone: '(11) 97777-6666',
      tags: ['Suporte']
    },
    {
      id: '3',
      name: 'Amanda Silva',
      company: 'E-commerce Brasil',
      avatar: 'https://i.pravatar.cc/150?u=amanda',
      channel: ChatChannel.WHATSAPP,
      lastMessage: 'Qual o prazo de entrega?',
      lastMessageTime: 'Ontem',
      status: 'queued',
      serviceId: null,
      agentId: null,
      customerId: null,
      unreadCount: 0,
      email: 'amanda@eco.com',
      phone: '(11) 98888-7777',
      tags: ['Dúvida']
    },
    {
      id: 'novo-numero-123',
      name: '+55 (47) 99123-4567',
      company: '',
      phone: '+55 (47) 99123-4567',
      avatar: '',
      status: 'queued',
      channel: ChatChannel.WHATSAPP,
      lastMessage: 'Olá, gostaria de um orçamento',
      lastMessageTime: '09:00',
      serviceId: null,
      agentId: null,
      customerId: null,
      unreadCount: 1,
      email: '',
      tags: []
    }
  ]);

  const messagesDb = ref<Record<string, IMessage[]>>({
    '1': [
      { id: generateUUIDv7(), text: 'Bom dia.', timestamp: '09:55', isMine: false, type: MessageType.TEXT },
      { id: generateUUIDv7(), text: 'Olá Fernanda!', timestamp: '10:00', isMine: true, type: MessageType.TEXT },
      { id: generateUUIDv7(), text: 'Pode confirmar o recebimento?', timestamp: '10:42', isMine: false, type: MessageType.TEXT }
    ]
  });

  // --- GETTERS ---
  const filteredContacts = computed(() => {
    // 1. Filtro de Status
    let list = contacts.value.filter(c => {
      if (currentFilter.value === ChatFilter.CHATS) return c.status === 'in_progress';
      if (currentFilter.value === ChatFilter.FILA) return c.status === 'queued';
      return true;
    });

    // 2. Filtro de Busca
    if (searchTerm.value) {
      const lower = searchTerm.value.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(lower) || c.phone.includes(lower));
    }

    // 3. Ordenação
    const sortedList = [...list];

    switch (currentSort.value) {
      case ChatSortOption.NEWEST: // Mais Recentes (Descrescente)
        sortedList.sort((a, b) => getTimeWeight(b.lastMessageTime) - getTimeWeight(a.lastMessageTime));
        break;

      case ChatSortOption.OLDEST: // Mais Antigos (Crescente)
        sortedList.sort((a, b) => getTimeWeight(a.lastMessageTime) - getTimeWeight(b.lastMessageTime));
        break;

      case ChatSortOption.LONGEST_WAIT: // Maior Espera = Mensagem mais antiga sem resposta
        // Removemos a verificação de 'unread' para focar estritamente no tempo (Visualmente mais coerente)
        sortedList.sort((a, b) => getTimeWeight(a.lastMessageTime) - getTimeWeight(b.lastMessageTime));
        break;

      case ChatSortOption.SHORTEST_WAIT: // Menor Espera = Mensagem mais recente
        sortedList.sort((a, b) => getTimeWeight(b.lastMessageTime) - getTimeWeight(a.lastMessageTime));
        break;

      default:
        sortedList.sort((a, b) => getTimeWeight(b.lastMessageTime) - getTimeWeight(a.lastMessageTime));
    }

    return sortedList;
  });

  const selectedContact = computed(() => contacts.value.find(c => c.id === activeContactId.value) || null);
  const messages = computed(() => activeContactId.value ? (messagesDb.value[activeContactId.value] || []) : []);
  const filaCount = computed(() => contacts.value.filter(c => c.status === 'queued').length);

  // --- ACTIONS ---
  function selectContact(contact: IContact) {
    activeContactId.value = contact.id;
    if (contact.status === 'in_progress') {
      const found = contacts.value.find(c => c.id === contact.id);
      if (found) found.unreadCount = 0;
    }
  }

  function sendMessage(text: string, type: MessageType, file?: File) {
    const chatId = activeContactId.value;
    if (!chatId) return;

    const newMessage: IMessage = {
      id: generateUUIDv7(),
      text: file ? file.name : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      type: type === MessageType.NOTE ? MessageType.NOTE : (file ? MessageType.TEXT : MessageType.TEXT),
    };

    if (!messagesDb.value[chatId]) messagesDb.value[chatId] = [];
    messagesDb.value[chatId].push(newMessage);

    const contact = contacts.value.find(c => c.id === chatId);
    if (contact) {
      contact.lastMessage = type === MessageType.NOTE ? 'Nota interna' : text;
      contact.lastMessageTime = 'Agora';
    }
  }

  function assumirChat(contactId: string) {
    const contact = contacts.value.find(c => c.id === contactId);

    if (contact) {
      const newServiceId = generateUUIDv7();

      contact.status = 'in_progress';
      contact.serviceId = newServiceId;
      contact.agentId = currentUser.value.id;

      if (!messagesDb.value[contactId]) messagesDb.value[contactId] = [];
      messagesDb.value[contactId].push({
        id: generateUUIDv7(),
        text: `Atendimento iniciado. Protocolo: #${newServiceId}`,
        timestamp: 'Agora',
        isMine: true,
        type: MessageType.ALERT
      });

      currentFilter.value = ChatFilter.CHATS;
      activeContactId.value = contactId;

      return newServiceId;
    }
    return null;
  }

  function finalizarChat(contactId: string, reason?: string) {
    const idx = contacts.value.findIndex(c => c.id === contactId);
    if (idx !== -1) {
      contacts.value.splice(idx, 1);
      activeContactId.value = null;
    }
  }

  function transferirChat(contactId: string, destination?: string) {
    const idx = contacts.value.findIndex(c => c.id === contactId);
    if (idx !== -1) {
      if (messagesDb.value[contactId]) {
        messagesDb.value[contactId].push({
          id: generateUUIDv7(),
          text: `Transferido para: ${destination || 'Outro departamento'}`,
          timestamp: 'Agora',
          isMine: true,
          type: MessageType.ALERT
        });
      }
      contacts.value.splice(idx, 1);
      activeContactId.value = null;
    }
  }

  function updateContact(id: string, updates: Partial<IContact>) {
    const contact = contacts.value.find(c => c.id === id);
    if (contact) {
      Object.assign(contact, updates);
    }
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
    contacts,
    activeContactId,
    currentFilter,
    currentSort,
    messages,
    selectedContact,
    filteredContacts,
    filaCount,
    currentUser,
    setFilter,
    selectContact,
    setSearchQuery,
    sendMessage,
    assumirChat,
    finalizarChat,
    transferirChat,
    updateContact,
    linkCustomerToChat
  };
});