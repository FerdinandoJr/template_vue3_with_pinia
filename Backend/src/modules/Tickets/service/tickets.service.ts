import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, TicketType } from '../data/ticket.entity';
import { TicketTag } from '../data/ticket-tag.entity';
import { TicketChecklist } from '../data/ticket-checklist.entity';
import { TicketAttachment } from '../data/ticket-attachment.entity';
import { CreateTicketDto, UpdateTicketDto } from '../dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { KanbanService } from '../../Kanban/service/kanban.service';

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
    private kanbanService: KanbanService,
  ) {}

  async findAll(tenantId: string, query?: TicketQueryDto) {
    const qb = this.ticketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .leftJoinAndSelect('ticket.assignee', 'assignee')
      .leftJoinAndSelect('ticket.tags', 'tags')
      .leftJoinAndSelect('ticket.checklist', 'checklist')
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
      qb.andWhere('(ticket.title ILIKE :q OR ticket.description ILIKE :q OR ticket.ticketNumber ILIKE :q)', { q: `%${query.q}%` });
    }

    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await qb
      .orderBy('ticket.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Garantir ticketNumber para todos
    for (const ticket of items) {
      if (!ticket.ticketNumber) {
        ticket.ticketNumber = await this.generateTicketNumber(ticket.tenantId);
        await this.ticketsRepository.save(ticket);
      }
    }

    return { items, total };
  }

  async findById(id: string): Promise<Ticket | null> {
    const ticket = await this.ticketsRepository.findOne({ 
      where: { id },
      relations: ['customer', 'assignee', 'tags', 'checklist', 'attachments']
    });
    
    if (ticket && !ticket.ticketNumber) {
      ticket.ticketNumber = await this.generateTicketNumber(ticket.tenantId);
      await this.ticketsRepository.save(ticket);
    }
    
    return ticket;
  }

  private async generateTicketNumber(tenantId: string): Promise<string> {
    console.log('[TicketsService] generateTicketNumber called for tenant:', tenantId);
    
    const lastTicket = await this.ticketsRepository.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' }
    });
    
    let nextNumber = 1;
    if (lastTicket && lastTicket.ticketNumber) {
      console.log('[TicketsService] lastTicket.ticketNumber:', lastTicket.ticketNumber);
      const match = lastTicket.ticketNumber.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    } else {
      console.log('[TicketsService] No previous ticket found, starting at 1');
    }
    
    const number = `TKT-${String(nextNumber).padStart(5, '0')}`;
    console.log('[TicketsService] Generated ticket number:', number);
    return number;
  }

  async create(tenantId: string, data: CreateTicketDto): Promise<Ticket> {
    console.log('[TicketsService] Creating ticket with data:', JSON.stringify(data, null, 2));
    
    const { tags, checklist, tagLabels, checklistItems, attachments, assignees, boardId, ...ticketData } = data as any;
    
    console.log('[TicketsService] ticketData after destructuring:', JSON.stringify(ticketData, null, 2));
    console.log('[TicketsService] assignees:', assignees);
    console.log('[TicketsService] tags:', tags);
    console.log('[TicketsService] checklist:', checklist);
    
    if (assignees && assignees.length > 0) {
      ticketData.assignedTo = assignees[0];
    }
    
    const ticketNumber = await this.generateTicketNumber(tenantId);
    
    const checklistSrc = checklist || checklistItems || [];
    
    console.log('[TicketsService] Creating ticket with:', {
      title: ticketData.title,
      priority: ticketData.priority,
      type: ticketData.type,
      customerId: ticketData.customerId,
      assignees: ticketData.assignees,
      estimatedHours: ticketData.estimatedHours,
      tags: tags?.length,
      checklist: checklistSrc?.length
    });
    
    const ticket = this.ticketsRepository.create({
      ...ticketData,
      ticketNumber,
      tenantId,
    } as Partial<Ticket>);
    
    const savedTicket = await this.ticketsRepository.save(ticket);
    console.log('[TicketsService] Ticket saved:', savedTicket.id, 'number:', ticketNumber, 'priority:', savedTicket.priority, 'customerId:', savedTicket.customerId);

    const tagSource = tags || tagLabels || [];
    if (tagSource.length > 0) {
      const tagEntities = tagSource.map((t: any) => this.tagsRepository.create({
        name: t.name || t.label || t,
        color: t.color || t.colorClass?.split(' ')[0]?.replace('bg-', '') || 'info',
        ticketId: savedTicket.id,
        tenantId,
      }));
      await this.tagsRepository.save(tagEntities);
    }

    const checklistSource = checklist || checklistItems || [];
    if (checklistSource.length > 0) {
      const checklistEntities = checklistSource.map((item: any, index: number) => this.checklistRepository.create({
        title: item.title || item.text || item,
        completed: item.completed ?? item.done ?? false,
        order: index,
        ticketId: savedTicket.id,
        tenantId,
      }));
      await this.checklistRepository.save(checklistEntities);
    }

    if (boardId) {
      const columns = await this.kanbanService.findColumnsByBoard(boardId);
      if (columns.length > 0) {
        await this.kanbanService.createCard(tenantId, {
          title: savedTicket.title,
          description: savedTicket.description,
          priority: savedTicket.priority,
          type: savedTicket.type,
          customerId: savedTicket.customerId,
          assignees: savedTicket.assignedTo ? [savedTicket.assignedTo] : [],
          estimatedHours: savedTicket.estimatedHours,
          columnId: columns[0].id,
          ticketId: savedTicket.id,
          order: 0,
        });
      }
    }

    return this.findById(savedTicket.id) as Promise<Ticket>;
  }

  async update(id: string, data: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const { tags, checklist, tagLabels, checklistItems, attachments, assignees, ...ticketData } = data as any;
    
    if (assignees && assignees.length > 0) {
      ticketData.assignedTo = assignees[0];
    }
    
    Object.assign(ticket, ticketData);
    await this.ticketsRepository.save(ticket);

    if (tags !== undefined || tagLabels !== undefined) {
      await this.tagsRepository.delete({ ticketId: id });
      const tagSource = tags || tagLabels || [];
      if (tagSource.length > 0) {
        const tagEntities = tagSource.map((t: any) => this.tagsRepository.create({
          name: t.name || t.label || t,
          color: t.color || t.colorClass?.split(' ')[0]?.replace('bg-', '') || 'info',
          ticketId: id,
          tenantId: ticket.tenantId,
        }));
        await this.tagsRepository.save(tagEntities);
      }
    }

    if (checklist !== undefined || checklistItems !== undefined) {
      await this.checklistRepository.delete({ ticketId: id });
      const checklistSource = checklist || checklistItems || [];
      if (checklistSource.length > 0) {
        const checklistEntities = checklistSource.map((item: any, index: number) => this.checklistRepository.create({
          title: item.title || item.text || item,
          completed: item.completed ?? item.done ?? false,
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