import type { IContact, IMessage } from "../domain/entities/chat";
import { ChatChannel, MessageType } from "../domain/valueObjects/chat-enums";

const mockContacts: IContact[] = [
  { 
    id: '1', name: 'Fernanda Lima', company: 'Tech Solutions', 
    avatar: 'https://i.pravatar.cc/150?u=fernanda', channel: ChatChannel.WHATSAPP,
    lastMessage: 'Pode confirmar o recebimento?', lastMessageTime: '10:42',
    status: 'online', unreadCount: 1, email: 'fernanda@tech.com', 
    phone: '(11) 99999-8888', tags: ['Financeiro', 'VIP']
  },
  { 
    id: '2', name: 'Roberto Carlos', company: 'Logística S.A', 
    avatar: 'https://i.pravatar.cc/150?u=roberto', channel: ChatChannel.WHATSAPP,
    lastMessage: 'Obrigado pelo suporte!', lastMessageTime: '09:15',
    status: 'online', unreadCount: 0, email: 'roberto@log.com', 
    phone: '(11) 97777-6666', tags: ['Suporte']
  },
  { 
    id: '3', name: 'Amanda Silva', company: 'E-commerce Brasil', 
    avatar: 'https://i.pravatar.cc/150?u=amanda', channel: ChatChannel.WHATSAPP,
    lastMessage: 'Qual o prazo de entrega?', lastMessageTime: 'Ontem',
    status: 'offline', unreadCount: 0, email: 'amanda@eco.com', 
    phone: '(11) 98888-7777', tags: ['Dúvida']
  }
];

const mockMessages: Record<string, IMessage[]> = {
  '1': [
    { id: 'm1', text: 'Bom dia, gostaria de saber sobre minha fatura.', timestamp: '09:55', isMine: false, type: MessageType.TEXT },
    { id: 'm2', text: 'Olá Fernanda! Vou verificar para você agora mesmo.', timestamp: '10:00', isMine: true, type: MessageType.TEXT },
    { id: 'm3', text: 'Cliente solicita fatura vencida.', timestamp: '10:01', isMine: false, type: MessageType.ALERT },
    { id: 'm4', text: 'Pode confirmar o recebimento?', timestamp: '10:42', isMine: false, type: MessageType.TEXT }
  ]
};

export const chatServices = {
  async getContacts(): Promise<IContact[]> {
    return new Promise(res => setTimeout(() => res(mockContacts), 300));
  },
  async getMessages(contactId: string): Promise<IMessage[]> {
    return new Promise(res => setTimeout(() => res(mockMessages[contactId] || []), 300));
  }
};