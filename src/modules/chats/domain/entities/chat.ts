import { ChatChannel } from '../valueObjects/chat-enums';

export interface IMessage {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  type: 'text' | 'image' | 'file' | 'audio' | 'alert' | 'note';
  fileUrl?: string;
  fileName?: string;
}

export interface IContact {
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
}