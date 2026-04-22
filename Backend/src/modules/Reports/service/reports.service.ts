import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../../Tickets/data/ticket.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async getTicketsSummary(tenantId: string): Promise<any> {
    const total = await this.ticketsRepository.count({ where: { tenantId } });
    const byStatus = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .groupBy('ticket.status')
      .getRawMany();

    const byPriority = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .groupBy('ticket.priority')
      .getRawMany();

    const avgResolutionTime = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('AVG(EXTRACT(EPOCH FROM(updatedAt - createdAt)))', 'avgTime')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .andWhere('ticket.status = :status', { status: TicketStatus.RESOLVED })
      .getRawOne();

    return { total, byStatus, byPriority, avgResolutionTime: avgResolutionTime?.avgTime || 0 };
  }

  async getAgentsPerformance(tenantId: string): Promise<any[]> {
    return this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.assignedTo', 'agentId')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN ticket.status = :resolved THEN 1 ELSE 0 END)', 'resolved')
      .addSelect('SUM(CASE WHEN ticket.status = :open THEN 1 ELSE 0 END)', 'open')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .andWhere('ticket.assignedTo IS NOT NULL')
      .groupBy('ticket.assignedTo')
      .setParameters({ resolved: TicketStatus.RESOLVED, open: TicketStatus.OPEN })
      .getRawMany();
  }

  async getCustomersSummary(tenantId: string): Promise<any> {
    const total = await this.ticketsRepository.count({ where: { tenantId } });
    const topCustomers = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.customerId', 'customerId')
      .addSelect('COUNT(*)', 'ticketCount')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .andWhere('ticket.customerId IS NOT NULL')
      .groupBy('ticket.customerId')
      .orderBy('ticketCount', 'DESC')
      .limit(10)
      .getRawMany();

    return { total, topCustomers };
  }
}