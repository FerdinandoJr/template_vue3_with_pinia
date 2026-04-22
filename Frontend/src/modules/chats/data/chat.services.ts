import { httpClient } from "@/core/infra/HttpClient";

interface IMessage {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  type: string;
  fileUrl?: string;
  fileName?: string;
  status?: 'sent' | 'delivered' | 'read' | 'error';
  replyTo?: IMessage;
}

interface IContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'queued' | 'in_progress' | 'finished';
  channel: string;
  company?: string;
  email?: string;
  tags: string[];
  serviceId?: string | null;
  agentId?: string | null;
  customerId?: string | null;
  accumulatedTime?: number;
  lastActiveAt?: number | null;
  isTyping?: boolean;
  createdAt?: number;
  serviceStartedAt?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const chatServices = {
  async getChats(): Promise<IContact[]> {
    const response = await httpClient.get<ApiResponse<IContact[]>>('/chats');
    return response.data;
  },

  async getMessages(chatId: string): Promise<IMessage[]> {
    const response = await httpClient.get<ApiResponse<IMessage[]>>(`/chats/${chatId}/messages`);
    return response.data;
  },

  async createChat(customerId?: string): Promise<any> {
    const response = await httpClient.post<ApiResponse<any>>('/chats', { customerId });
    return response.data;
  },

  async sendMessage(chatId: string, senderId: string, senderType: string, message: string): Promise<IMessage> {
    const response = await httpClient.post<ApiResponse<IMessage>>(`/chats/${chatId}/messages`, {
      senderId,
      senderType,
      message,
    });
    return response.data;
  },

  async closeChat(chatId: string): Promise<void> {
    await httpClient.post(`/chats/${chatId}/close`, {});
  },

  async getQueueCount(): Promise<number> {
    const response = await httpClient.get<ApiResponse<number>>('/chats/queue-count');
    return response.data;
  },

  async getQueue(): Promise<IContact[]> {
    const response = await httpClient.get<ApiResponse<IContact[]>>('/chats/queue');
    return response.data;
  },
};

export type { IMessage, IContact };