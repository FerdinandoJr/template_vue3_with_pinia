import { Injectable, NotFoundException, BadRequestException, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between, In } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, TicketType, TicketSource } from '../data/ticket.entity';
import { TicketTag } from '../data/ticket-tag.entity';
import { TicketChecklist } from '../data/ticket-checklist.entity';
import { TicketAttachment } from '../data/ticket-attachment.entity';
import { CreateTicketDto, UpdateTicketDto } from '../dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { KanbanService } from '../../Kanban/service/kanban.service';

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketStats {
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  byType: Record<TicketType, number>;
  avgResolutionTime: number;
  firstResponseRate: number;
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

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

  async findAll(tenantId: string, query?: TicketQueryDto): Promise<PaginatedResult<Ticket>> {
    const qb = this.ticketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.customer', 'customer')
      .leftJoinAndSelect('ticket.assignee', 'assignee')
      .leftJoinAndSelect('ticket.tags', 'tags')
      .leftJoinAndSelect('ticket.checklist', 'checklist')
      .withDeleted()
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

    for (const ticket of items) {
      if (!ticket.ticketNumber) {
        ticket.ticketNumber = await this.generateTicketNumber(tenantId);
        await this.ticketsRepository.save(ticket);
      }
    }

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, includeDeleted = false): Promise<Ticket | null> {
    const qb = this.ticketsRepository.findOne({ 
      where: { id },
      relations: ['customer', 'assignee', 'tags', 'checklist', 'attachments', 'creator']
    });
    
    if (includeDeleted) {
      return this.ticketsRepository.findOne({ 
        where: { id },
        relations: ['customer', 'assignee', 'tags', 'checklist', 'attachments', 'creator'],
        withDeleted: true
      });
    }
    
    const ticket = await qb;
    
    if (ticket && !ticket.ticketNumber) {
      ticket.ticketNumber = await this.generateTicketNumber(ticket.tenantId);
      await this.ticketsRepository.save(ticket);
    }
    
    if (ticket) {
      (ticket as any).assignees = ticket.assignedTo ? [ticket.assignedTo] : [];
    }
    
    return ticket;
  }

  async findByTicketNumber(tenantId: string, ticketNumber: string): Promise<Ticket | null> {
    const ticket = await this.ticketsRepository.findOne({ 
      where: { tenantId, ticketNumber },
      relations: ['customer', 'assignee', 'tags', 'checklist', 'attachments']
    });
    return ticket;
  }

  private async generateTicketNumber(tenantId: string): Promise<string> {
    const lockKey = `ticket_number_lock_${tenantId}`;
    
    const lastTicket = await this.ticketsRepository.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' }
    });
    
    let nextNumber = 1;
    if (lastTicket && lastTicket.ticketNumber) {
      const match = lastTicket.ticketNumber.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    return `TKT-${String(nextNumber).padStart(5, '0')}`;
  }

  async create(tenantId: string, userId: string, data: CreateTicketDto): Promise<Ticket> {
    const { tags, checklist, tagLabels, checklistItems, attachments, assignees, boardId, ...ticketData } = data as any;
    
    this.logger.log(`[createTicket] checklist from data: ${JSON.stringify(checklist)}`);
    this.logger.log(`[createTicket] checklistItems from data: ${JSON.stringify(checklistItems)}`);
    
    if (assignees && assignees.length > 0) {
      ticketData.assignedTo = assignees[0];
    }
    
    const ticketNumber = await this.generateTicketNumber(tenantId);
    
    const checklistSrc = checklist || checklistItems || [];
    
    const ticket = this.ticketsRepository.create({
      ...ticketData,
      ticketNumber,
      tenantId,
      createdBy: userId,
      source: ticketData.source || TicketSource.MANUAL,
    } as Partial<Ticket>);
    
    const savedTicket = await this.ticketsRepository.save(ticket);

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

    return this.findById(savedTicket.id) as Promise<Ticket>;
  }

  async update(id: string, userId: string, data: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} não encontrado`);
    }

    const { tags, checklist, tagLabels, checklistItems, attachments, assignees, ...ticketData } = data as any;
    
    const previousStatus = ticket.status;
    const previousAssignee = ticket.assignedTo;
    
    if (assignees && assignees.length > 0) {
      ticketData.assignedTo = assignees[0];
    }
    
    if (ticketData.status && ticketData.status !== previousStatus) {
      ticketData.resolvedAt = ticketData.status === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt;
      ticketData.closedAt = ticketData.status === TicketStatus.CLOSED ? new Date() : ticket.closedAt;
      
      if (!ticket.firstResponseAt && ticketData.assignedTo && ticketData.assignedTo !== previousAssignee) {
        ticketData.firstResponseAt = new Date();
      }
      
      await this.kanbanService.syncCardFromTicket(id, ticketData.status);
      this.logger.log(`Sincronizando card do ticket ${id} para status ${ticketData.status}`);
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
      throw new NotFoundException(`Ticket #${id} não encontrado`);
    }
    await this.ticketsRepository.softRemove(ticket);
  }

  async restore(id: string): Promise<Ticket> {
    const ticket = await this.findById(id, true);
    if (!ticket || ticket.deletedAt) {
      throw new NotFoundException(`Ticket #${id} não encontrado ou não excluído`);
    }
    await this.ticketsRepository.restore(id);
    return this.findById(id);
  }

  async assignTicket(ticketId: string, userId: string, assigneeId: string): Promise<Ticket> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} não encontrado`);
    }
    
    ticket.assignedTo = assigneeId;
    
    if (!ticket.firstResponseAt) {
      ticket.firstResponseAt = new Date();
    }
    
    await this.ticketsRepository.save(ticket);
    return this.findById(ticketId);
  }

  async changeStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} não encontrado`);
    }
    
    const previousStatus = ticket.status;
    ticket.status = status;
    
    if (status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    } else if (status === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
    }
    
    await this.ticketsRepository.save(ticket);
    
    if (previousStatus !== status) {
      await this.kanbanService.syncCardFromTicket(ticketId, status);
      this.logger.log(`Status alterado: ticket ${ticketId} → ${status}, card sincronizado`);
    }
    
    return this.findById(ticketId);
  }

  async addComment(ticketId: string, tenantId: string, comment: string, userId: string): Promise<void> {
    const ticket = await this.findById(ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${ticketId} não encontrado`);
    }
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

  async getStats(tenantId: string): Promise<TicketStats> {
    const [byStatus, byPriority, byType] = await Promise.all([
      this.countByStatus(tenantId),
      this.getPriorityStats(tenantId),
      this.getTypeStats(tenantId),
    ]);

    const resolvedTickets = await this.ticketsRepository.find({
      where: { tenantId, status: TicketStatus.RESOLVED }
    });
    
    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalTime = resolvedTickets.reduce((acc, t) => {
        if (t.resolvedAt && t.createdAt) {
          return acc + (t.resolvedAt.getTime() - t.createdAt.getTime());
        }
        return acc;
      }, 0);
      avgResolutionTime = totalTime / resolvedTickets.length / (1000 * 60 * 60);
    }

    const ticketsWithFirstResponse = await this.ticketsRepository.count({
      where: { tenantId }
    });

    return {
      byStatus,
      byPriority,
      byType,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      firstResponseRate: ticketsWithFirstResponse > 0 ? Math.round((ticketsWithFirstResponse / ticketsWithFirstResponse) * 100) : 0,
    };
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

  private mapStatusToColumnTitle(status: TicketStatus): string {
    const mapping: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: 'pendente',
      [TicketStatus.IN_PROGRESS]: 'fazer',
      [TicketStatus.WAITING]: 'análise',
      [TicketStatus.RESOLVED]: 'desenvolvimento',
      [TicketStatus.CLOSED]: 'finalizado',
    };
    return mapping[status] || 'pendente';
  }

  async syncKanbanCard(ticketId: string, ticketStatus: TicketStatus): Promise<void> {
    await this.kanbanService.syncCardFromTicket(ticketId, ticketStatus);
  }
}