import type { ChatChannel, MessageType } from "../valueObjects/chat-enums";

export interface IMessage {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  type: MessageType;
  atendimentoId?: string;
}

export interface IContact {
  id: string;
  name: string;
  company: string;
  avatar: string;
  channel: ChatChannel;
  lastMessage: string;
  lastMessageTime: string;
  status: 'waiting' | 'in_progress' | 'finished';
  unreadCount: number;
  email: string;
  phone: string;
  tags: string[];
  currentAtendimentoId?: string;
}