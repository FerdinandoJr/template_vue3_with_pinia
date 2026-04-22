import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, ChatMessage } from '../data/chat.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private messagesRepository: Repository<ChatMessage>,
  ) {}

  async findAllChats(tenantId: string): Promise<Chat[]> {
    return this.chatsRepository.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async getQueueCount(tenantId: string): Promise<number> {
    const chats = await this.chatsRepository.find({ where: { tenantId, status: 'open' } });
    return chats.filter(c => !c.agentId).length;
  }

  async getQueue(tenantId: string): Promise<Chat[]> {
    return this.chatsRepository.find({ where: { tenantId, status: 'open' }, order: { createdAt: 'DESC' } });
  }

  async findChatMessages(chatId: string): Promise<ChatMessage[]> {
    return this.messagesRepository.find({ where: { chatId }, order: { createdAt: 'ASC' } });
  }

  async createChat(tenantId: string, customerId?: string): Promise<Chat> {
    const chat = this.chatsRepository.create({ customerId, tenantId, status: 'open' });
    return this.chatsRepository.save(chat);
  }

  async sendMessage(chatId: string, senderId: string, senderType: string, message: string): Promise<ChatMessage> {
    const msg = this.messagesRepository.create({ chatId, senderId, senderType, message });
    return this.messagesRepository.save(msg);
  }

  async closeChat(id: string): Promise<Chat> {
    const chat = await this.chatsRepository.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Chat não encontrado');
    chat.status = 'closed';
    return this.chatsRepository.save(chat);
  }
}