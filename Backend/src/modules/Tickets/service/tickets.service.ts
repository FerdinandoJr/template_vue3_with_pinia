import { Injectable, NotFoundException, BadRequestException, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between, In } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority, TicketType, TicketSource } from '../data/ticket.entity';
import { TicketTag } from '../data/ticket-tag.entity';
import { TicketChecklist } from '../data/ticket-checklist.entity';
import { TicketAttachment } from '../data/ticket-attachment.entity';
import { CreateTicketDto, UpdateTicketDto } from '../dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { KanbanColumn } from '../../Kanban/data/kanban.entity';

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
    private eventEmitter: EventEmitter2,
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
    if (query?.ownerOnly && query?.userId && (!query.assignees || query.assignees.length === 0)) {
      qb.andWhere('(ticket.createdBy = :userId OR ticket.assignedTo = :userId)', { userId: query.userId });
    }
    if (query?.assignees && query.assignees.length > 0) {
      qb.andWhere('ticket.assignedTo IN (:...assignees)', { assignees: query.assignees });
    }
    if (query?.customers && query.customers.length > 0) {
      qb.andWhere('ticket.customerId IN (:...customers)', { customers: query.customers });
    }
    if (query?.startDate && query?.endDate) {
      qb.andWhere('ticket.createdAt BETWEEN :start AND :end', { 
        start: new Date(query.startDate), 
        end: new Date(query.endDate) 
      });
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
      this.logger.log(`[findById] Ticket ${id} loaded: checklist items = ${ticket.checklist?.length || 0}`);
      if (ticket.checklist && ticket.checklist.length > 0) {
        this.logger.log(`[findById]   - checklist:`, ticket.checklist.map(c => ({ id: c.id, title: c.title, completed: c.completed })));
      }
    } else {
      this.logger.warn(`[findById] Ticket ${id} not found`);
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
    const { tags, checklist, tagLabels, checklistItems, attachments, assignees, boardId, kanbanColumnId, ...ticketData } = data as any;
    
    this.logger.log(`[createTicket] checklist from data: ${JSON.stringify(checklist)}`);
    this.logger.log(`[createTicket] checklistItems from data: ${JSON.stringify(checklistItems)}`);
    
    if (assignees !== undefined) {
      ticketData.assignedTo = assignees.length > 0 ? assignees[0] : null;
    }
    
    const ticketNumber = await this.generateTicketNumber(tenantId);
    
    const checklistSrc = checklist || checklistItems || [];
    
    const ticket = this.ticketsRepository.create({
      ...ticketData,
      ticketNumber,
      tenantId,
      createdBy: userId,
      source: ticketData.source || TicketSource.MANUAL,
      boardId: boardId || null,
      kanbanColumnId: kanbanColumnId || null,
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

    const finalTicket = await this.findById(savedTicket.id) as Ticket;
    await this.eventEmitter.emitAsync('ticket.created', { ...finalTicket, boardId, assignees, kanbanColumnId });
    return finalTicket;
  }

  async update(id: string, userId: string, data: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} não encontrado`);
    }

    const { tags, checklist, tagLabels, checklistItems, attachments, assignees, boardId, kanbanColumnId, ...ticketData } = data as any;
    
    const previousStatus = ticket.status;
    const previousAssignee = ticket.assignedTo;
    
    this.logger.log(`[TicketsService.update] data received: ${JSON.stringify(data)}`);
    this.logger.log(`[TicketsService.update] assignees received: ${JSON.stringify(assignees)}`);
    this.logger.log(`[TicketsService.update] customerId received: ${data.customerId}`);
    this.logger.log(`[TicketsService.update] kanbanColumnId received: ${kanbanColumnId}`);
    
    if (assignees !== undefined) {
      ticketData.assignedTo = assignees.length > 0 ? assignees[0] : null;
      if (ticketData.assignedTo !== previousAssignee) {
        if (ticketData.assignedTo) {
          ticket.assignee = { id: ticketData.assignedTo } as any;
        } else {
          ticket.assignee = null as any;
        }
      }
    }
    
    if (data.customerId !== undefined) {
      ticketData.customerId = data.customerId === '' ? null : data.customerId;
      this.logger.log(`[TicketsService.update] Setting customerId to: ${ticketData.customerId}`);
    }
    
    if (boardId !== undefined) {
      ticketData.boardId = boardId;
      this.logger.log(`[TicketsService.update] Setting boardId to: ${boardId}`);
    }
    
    if (kanbanColumnId !== undefined) {
      ticketData.kanbanColumnId = kanbanColumnId;
      this.logger.log(`[TicketsService.update] Setting kanbanColumnId to: ${kanbanColumnId}`);
    }
    
    if (ticketData.status && ticketData.status !== previousStatus) {
      ticketData.resolvedAt = ticketData.status === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt;
      ticketData.closedAt = ticketData.status === TicketStatus.CLOSED ? new Date() : ticket.closedAt;
      
      if (!ticket.firstResponseAt && ticketData.assignedTo && ticketData.assignedTo !== previousAssignee) {
        ticketData.firstResponseAt = new Date();
      }
    }
    
    Object.assign(ticket, ticketData);
    this.logger.log(`[TicketsService.update] Saving ticket with customerId: ${ticket.customerId}, boardId: ${ticket.boardId}, kanbanColumnId: ${ticket.kanbanColumnId}`);
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

    const updatedTicket = await this.findById(id) as Ticket;
    const emitPayload: any = { ...updatedTicket };
    if (assignees !== undefined) {
      emitPayload.assignees = assignees;
    }
    await this.eventEmitter.emitAsync('ticket.updated', emitPayload);
    return updatedTicket;
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.findById(id, true);
    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} não encontrado`);
    }
    await this.ticketsRepository.remove(ticket);
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
    const updatedTicket = await this.findById(ticketId);
    this.eventEmitter.emit('ticket.updated', updatedTicket);
    return updatedTicket;
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
      this.eventEmitter.emit('ticket.updated', ticket);
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

  @OnEvent('kanban.card.created')
  async handleKanbanCardCreated(card: any) {
    if (card.ticketId) return;
    this.logger.log(`Syncing new kanban card to ticket: ${card.id}`);

    try {
      const targetColumn = await this.ticketsRepository.manager
        .getRepository(KanbanColumn)
        .findOne({ where: { id: card.columnId } });
      
      let status = TicketStatus.OPEN;
      if (targetColumn) {
        status = (targetColumn as any).ticketStatus as TicketStatus;
        if (!status) {
          const title = targetColumn.title.toLowerCase();
          if (title.includes('pendente') || title.includes('open')) status = TicketStatus.OPEN;
          else if (title.includes('fazer') || title.includes('progress') || title.includes('desenvolvimento') || title.includes('andamento')) status = TicketStatus.IN_PROGRESS;
          else if (title.includes('análise') || title.includes('analise') || title.includes('waiting')) status = TicketStatus.WAITING;
          else if (title.includes('resolvido') || title.includes('resolved') || title.includes('finalizado')) status = TicketStatus.RESOLVED;
          else if (title.includes('closed') || title.includes('concluído') || title.includes('concluido')) status = TicketStatus.CLOSED;
          else status = TicketStatus.OPEN;
        }
      }

      const checklistItems = (card.checklist || []).map((item: any, idx: number) => ({
        title: item.title || item.text || String(item),
        completed: item.completed ?? false,
        order: idx
      }));

      const tags = (card.tags || []).map((t: any) => ({
        name: t.label || t.name || String(t),
        color: t.colorClass?.split(' ')[0]?.replace('bg-', '') || 'info'
      }));

      const ticketData = {
        title: card.title || 'Sem Título',
        description: card.description || '',
        status,
        priority: card.priority || TicketPriority.MEDIUM,
        type: card.type || TicketType.SUPPORT,
        customerId: card.customerId || null,
        assignedTo: card.assignees && card.assignees.length > 0 ? card.assignees[0] : null,
        estimatedHours: card.estimatedHours || 0,
        tenantId: card.tenantId,
        source: TicketSource.MANUAL,
        boardId: card.boardId || null,
        kanbanColumnId: card.columnId,
      };

      const ticketNumber = await this.generateTicketNumber(card.tenantId);
      const ticket = this.ticketsRepository.create({
        ...ticketData,
        ticketNumber
      } as Partial<Ticket>);

      const savedTicket = await this.ticketsRepository.save(ticket);

      if (tags.length > 0) {
        const tagEntities = tags.map((t: any) => this.tagsRepository.create({ ...t, ticketId: savedTicket.id, tenantId: card.tenantId }));
        await this.tagsRepository.save(tagEntities);
      }

      if (checklistItems.length > 0) {
        const checklistEntities = checklistItems.map((c: any) => this.checklistRepository.create({ ...c, ticketId: savedTicket.id, tenantId: card.tenantId }));
        await this.checklistRepository.save(checklistEntities);
      }

     
      await this.ticketsRepository.manager.update('kanban_cards', card.id, { 
        ticketId: savedTicket.id,
        ticketNumber: ticketNumber
      });
      
    } catch (error) {
      this.logger.warn(`Failed to create ticket from card ${card.id}: ${error.message}`);
    }
  }

  @OnEvent('kanban.card.updated')
  async handleKanbanCardUpdated(card: any) {
    if (!card.ticketId) return;
    if (card._skipTicketSync) return;
    this.logger.log(`Syncing kanban card update to ticket: ${card.ticketId}`);
    
    try {
      const ticket = await this.findById(card.ticketId);
      if (!ticket) return;

      const targetColumn = await this.ticketsRepository.manager
        .getRepository(KanbanColumn)
        .findOne({ where: { id: card.columnId } });
      
      if (targetColumn) {
        let newStatus = (targetColumn as any).ticketStatus as TicketStatus;
        
       
        if (!newStatus) {
          const title = targetColumn.title.toLowerCase();
          if (title.includes('pendente') || title.includes('open')) newStatus = TicketStatus.OPEN;
          else if (title.includes('fazer') || title.includes('progress') || title.includes('desenvolvimento') || title.includes('andamento')) newStatus = TicketStatus.IN_PROGRESS;
          else if (title.includes('análise') || title.includes('analise') || title.includes('waiting')) newStatus = TicketStatus.WAITING;
          else if (title.includes('resolvido') || title.includes('resolved') || title.includes('finalizado')) newStatus = TicketStatus.RESOLVED;
          else if (title.includes('closed') || title.includes('concluído') || title.includes('concluido')) newStatus = TicketStatus.CLOSED;
        }

        if (newStatus) {
         
          const normalizedStatus = newStatus.toLowerCase() as TicketStatus;
          
          if (Object.values(TicketStatus).includes(normalizedStatus) && ticket.status !== normalizedStatus) {
            this.logger.log(`[Sync] Updating ticket ${ticket.id} status from ${ticket.status} to ${normalizedStatus}`);
            ticket.status = normalizedStatus;
            ticket.resolvedAt = normalizedStatus === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt;
            ticket.closedAt = normalizedStatus === TicketStatus.CLOSED ? new Date() : ticket.closedAt;
          }
        }
        ticket.kanbanColumnId = card.columnId;
      }

      ticket.title = card.title;
      ticket.description = card.description;
      ticket.priority = card.priority || ticket.priority;
      ticket.type = card.type || ticket.type;
      if (card.assignees !== undefined) {
        const newAssignedTo = (card.assignees && card.assignees.length > 0) ? card.assignees[0] : null;
        if (ticket.assignedTo !== newAssignedTo) {
          ticket.assignedTo = newAssignedTo;
          if (newAssignedTo) {
            ticket.assignee = { id: newAssignedTo } as any;
          } else {
            ticket.assignee = null as any;
          }
        }
      }
      ticket.customerId = card.customerId || ticket.customerId;
      ticket.estimatedHours = card.estimatedHours || ticket.estimatedHours;
      if (card.boardId) {
        ticket.boardId = card.boardId;
      }
      if (card.columnId) {
        ticket.kanbanColumnId = card.columnId;
      }

      const savedTicket = await this.ticketsRepository.save(ticket);
      (savedTicket as any)._skipKanbanSync = true;
      this.eventEmitter.emit('ticket.updated', savedTicket);
    } catch (error) {
      this.logger.warn(`Failed to update ticket from card ${card.id}: ${error.message}`);
    }
  }
}
