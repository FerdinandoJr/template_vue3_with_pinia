import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '../data/ticket.entity';
import { TicketTag } from '../data/ticket-tag.entity';
import { TicketChecklist } from '../data/ticket-checklist.entity';
import { TicketAttachment } from '../data/ticket-attachment.entity';
import { CreateTicketDto, UpdateTicketDto } from '../dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepository: Repository<Ticket>,
    @InjectRepository(TicketTag)
    private tagsRepository: Repository<TicketTag>,
    @InjectRepository(TicketChecklist)
    private checklistRepository: Repository<TicketChecklist>,
    @InjectRepository(TicketAttachment)
    private attachmentsRepository: Repository<TicketAttachment>,
  ) {}

  async findAll(tenantId: string, query?: TicketQueryDto) {
    const qb = this.ticketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .leftJoinAndSelect('ticket.assignee', 'assignee')
      .leftJoinAndSelect('ticket.tags', 'tags')
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
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await qb
      .orderBy('ticket.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketsRepository.findOne({ 
      where: { id },
      relations: ['customer', 'assignee', 'tags']
    });
  }

  async create(tenantId: string, data: CreateTicketDto): Promise<Ticket> {
    const { tags, checklist, attachments, ...ticketData } = data as any;
    
    const ticket = this.ticketsRepository.create({
      ...ticketData,
      tenantId,
    } as Partial<Ticket>);
    const savedTicket = await this.ticketsRepository.save(ticket);

    if (tags && tags.length > 0) {
      const tagEntities = tags.map((t: any) => this.tagsRepository.create({
        name: t.name || t,
        color: t.color || 'info',
        ticketId: savedTicket.id,
        tenantId,
      }));
      await this.tagsRepository.save(tagEntities);
    }

    if (checklist && checklist.length > 0) {
      const checklistEntities = checklist.map((item: any, index: number) => this.checklistRepository.create({
        title: item.title || item,
        completed: item.completed || false,
        order: index,
        ticketId: savedTicket.id,
        tenantId,
      }));
      await this.checklistRepository.save(checklistEntities);
    }

    return this.findById(savedTicket.id) as Promise<Ticket>;
  }

  async update(id: string, data: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const { tags, checklist, attachments, ...ticketData } = data as any;
    
    Object.assign(ticket, ticketData);
    await this.ticketsRepository.save(ticket);

    if (tags !== undefined) {
      await this.tagsRepository.delete({ ticketId: id });
      if (tags && tags.length > 0) {
        const tagEntities = tags.map((t: any) => this.tagsRepository.create({
          name: t.name || t,
          color: t.color || 'info',
          ticketId: id,
          tenantId: ticket.tenantId,
        }));
        await this.tagsRepository.save(tagEntities);
      }
    }

    if (checklist !== undefined) {
      await this.checklistRepository.delete({ ticketId: id });
      if (checklist && checklist.length > 0) {
        const checklistEntities = checklist.map((item: any, index: number) => this.checklistRepository.create({
          title: item.title || item,
          completed: item.completed || false,
          order: index,
          ticketId: id,
          tenantId: ticket.tenantId,
        }));
        await this.checklistRepository.save(checklistEntities);
      }
    }

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }
    await this.ticketsRepository.remove(ticket);
  }

  async getChecklist(ticketId: string): Promise<TicketChecklist[]> {
    return this.checklistRepository.find({ 
      where: { ticketId },
      order: { order: 'ASC' }
    });
  }

  async addChecklistItem(ticketId: string, tenantId: string, title: string): Promise<TicketChecklist> {
    const maxOrder = await this.checklistRepository
      .createQueryBuilder('item')
      .where('item.ticketId = :ticketId', { ticketId })
      .select('MAX(item.order)', 'max')
      .getRawOne();
    
    const item = this.checklistRepository.create({
      title,
      completed: false,
      order: (maxOrder?.max || 0) + 1,
      ticketId,
      tenantId,
    });
    return this.checklistRepository.save(item);
  }

  async updateChecklistItem(id: string, data: { title?: string; completed?: boolean }): Promise<TicketChecklist> {
    const item = await this.checklistRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Item não encontrado');
    }
    if (data.title !== undefined) item.title = data.title;
    if (data.completed !== undefined) item.completed = data.completed;
    return this.checklistRepository.save(item);
  }

  async deleteChecklistItem(id: string): Promise<void> {
    await this.checklistRepository.delete(id);
  }

  async getAttachments(ticketId: string): Promise<TicketAttachment[]> {
    return this.attachmentsRepository.find({ where: { ticketId } });
  }

  async addAttachment(ticketId: string, tenantId: string, fileData: Partial<TicketAttachment>): Promise<TicketAttachment> {
    const attachment = this.attachmentsRepository.create({
      ...fileData,
      ticketId,
      tenantId,
    });
    return this.attachmentsRepository.save(attachment);
  }

  async deleteAttachment(id: string): Promise<void> {
    await this.attachmentsRepository.delete(id);
  }

  async countByStatus(tenantId: string): Promise<Record<TicketStatus, number>> {
    const result = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .groupBy('ticket.status')
      .getRawMany();

    const counts = {
      [TicketStatus.OPEN]: 0,
      [TicketStatus.IN_PROGRESS]: 0,
      [TicketStatus.WAITING]: 0,
      [TicketStatus.RESOLVED]: 0,
      [TicketStatus.CLOSED]: 0,
    };

    result.forEach(r => {
      counts[r.status as TicketStatus] = parseInt(r.count);
    });

    return counts;
  }

  async getPriorityStats(tenantId: string): Promise<Record<TicketPriority, number>> {
    const result = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .groupBy('ticket.priority')
      .getRawMany();

    const counts = {
      [TicketPriority.LOW]: 0,
      [TicketPriority.MEDIUM]: 0,
      [TicketPriority.HIGH]: 0,
      [TicketPriority.URGENT]: 0,
    };

    result.forEach(r => {
      counts[r.priority as TicketPriority] = parseInt(r.count);
    });

    return counts;
  }

  async getTypeStats(tenantId: string): Promise<Record<TicketType, number>> {
    const result = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .select('ticket.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('ticket.tenantId = :tenantId', { tenantId })
      .groupBy('ticket.type')
      .getRawMany();

    const counts = {
      [TicketType.BUG]: 0,
      [TicketType.FEATURE]: 0,
      [TicketType.SUPPORT]: 0,
      [TicketType.INTERNAL]: 0,
    };

    result.forEach(r => {
      counts[r.type as TicketType] = parseInt(r.count);
    });

    return counts;
  }
}