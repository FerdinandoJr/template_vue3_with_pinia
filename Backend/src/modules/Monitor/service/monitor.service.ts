import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../../Tickets/data/ticket.entity';
import { User } from '../../../database/postgres/user.entity';
import { Chat } from '../../Chats/data/chat.entity';

@Injectable()
export class MonitorService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
  ) {}

  async getDashboardData(tenantId: string): Promise<any> {
    const totalTickets = await this.ticketsRepository.count({ where: { tenantId } });
    const openTickets = await this.ticketsRepository.count({ where: { tenantId, status: TicketStatus.OPEN } });
    const inProgressTickets = await this.ticketsRepository.count({ where: { tenantId, status: TicketStatus.IN_PROGRESS } });
    const resolvedTickets = await this.ticketsRepository.count({ where: { tenantId, status: TicketStatus.RESOLVED } });
    const totalUsers = await this.usersRepository.count({ where: { tenantId } });
    
    const totalChats = await this.chatsRepository.count({ where: { tenantId } });
    const openChats = await this.chatsRepository.count({ where: { tenantId, status: 'open' } });
    const closedChats = await this.chatsRepository.count({ where: { tenantId, status: 'closed' } });

    const recentTickets = await this.ticketsRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      stats: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        totalUsers,
        totalChats,
        openChats,
        closedChats,
      },
      recentTickets,
    };
  }

  async getSystemHealth(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}