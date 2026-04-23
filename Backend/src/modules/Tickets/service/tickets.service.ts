import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../data/ticket.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
  ) {}

  async findAll(tenantId: string, query?: TicketQueryDto): Promise<{ items: Ticket[]; total: number }> {
    const qb = this.ticketsRepository.createQueryBuilder('ticket')
      .where('ticket.tenantId = :tenantId', { tenantId });
    
    if (query?.status && query.status !== 'all') {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }
    if (query?.priority) {
      qb.andWhere('ticket.priority = :priority', { priority: query.priority });
    }
    if (query?.customerId) {
      qb.andWhere('ticket.customerId = :customerId', { customerId: query.customerId });
    }
    if (query?.assignedTo) {
      qb.andWhere('ticket.assignedTo = :assignedTo', { assignedTo: query.assignedTo });
    }
    if (query?.q) {
      qb.andWhere('(ticket.title ILIKE :q OR ticket.description ILIKE :q)', { q: `%${query.q}%` });
    }

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await qb
      .orderBy('ticket.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketsRepository.findOne({ where: { id } });
  }

  async create(tenantId: string, data: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      ...data,
      tenantId,
    });
    return this.ticketsRepository.save(ticket);
  }

  async update(id: string, data: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }
    Object.assign(ticket, data);
    return this.ticketsRepository.save(ticket);
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }
    await this.ticketsRepository.remove(ticket);
  }

  async countByStatus(tenantId: string): Promise<Record<TicketStatus, number>> {
    const tickets = await this.ticketsRepository.find({ where: { tenantId } });
    const counts = {
      [TicketStatus.OPEN]: 0,
      [TicketStatus.IN_PROGRESS]: 0,
      [TicketStatus.WAITING]: 0,
      [TicketStatus.RESOLVED]: 0,
      [TicketStatus.CLOSED]: 0,
    };
    tickets.forEach(t => counts[t.status]++);
    return counts;
  }
}