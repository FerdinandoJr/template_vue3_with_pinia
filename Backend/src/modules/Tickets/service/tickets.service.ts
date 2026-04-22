import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
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

  async findAll(tenantId: string, query?: TicketQueryDto): Promise<Ticket[]> {
    const where: FindOptionsWhere<Ticket> = { tenantId };
    
    if (query?.status) where.status = query.status;
    if (query?.priority) where.priority = query.priority;
    if (query?.customerId) where.customerId = query.customerId;
    if (query?.assignedTo) where.assignedTo = query.assignedTo;

    return this.ticketsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
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