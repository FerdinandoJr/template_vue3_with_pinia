import { ChatChannel } from '../valueObjects/chat-enums';

type IMessage = {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  type: string;
  fileUrl?: string;
  fileName?: string;
  status?: 'sent' | 'delivered' | 'read' | 'error';
  replyTo?: IMessage;
};

type IContact = {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'queued' | 'in_progress' | 'finished';
  channel: ChatChannel;
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
  slaNotifiedQueued?: boolean;
  slaNotifiedService?: boolean;
};

export type { IMessage, IContact };