import type { ChatChannel, MessageType } from "../valueObjects/chat-enums";

export interface IMessage {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  type: MessageType;
}

export interface IContact {
  id: string;
  name: string;
  company: string;
  avatar: string;
  channel: ChatChannel;
  lastMessage: string;
  lastMessageTime: string;
  status: 'online' | 'offline';
  unreadCount: number;
  email: string;
  phone: string;
  tags: string[];
}