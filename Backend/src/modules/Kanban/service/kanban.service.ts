import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { KanbanColumn, KanbanCard, KanbanBoard } from '../data/kanban.entity';
import { CreateKanbanColumnDto, CreateKanbanCardDto, CreateKanbanBoardDto, UpdateKanbanBoardDto } from '../dto/create-kanban.dto';
import { TicketStatus } from '../../Tickets/data/ticket.entity';
import { Ticket } from '../../Tickets/data/ticket.entity';

@Injectable()
export class KanbanService {
  private readonly logger = new Logger(KanbanService.name);

  constructor(
    @InjectRepository(KanbanBoard)
    private boardsRepository: Repository<KanbanBoard>,
    @InjectRepository(KanbanColumn)
    private columnsRepository: Repository<KanbanColumn>,
    @InjectRepository(KanbanCard)
    private cardsRepository: Repository<KanbanCard>,
    private eventEmitter: EventEmitter2,
  ) { }

 
  async findAllBoards(tenantId: string): Promise<KanbanBoard[]> {
    return this.boardsRepository.find({ where: { tenantId }, order: { createdAt: 'ASC' } });
  }

  async createBoard(tenantId: string, data: CreateKanbanBoardDto): Promise<KanbanBoard> {
    const board = this.boardsRepository.create({ ...data, tenantId });
    const savedBoard = await this.boardsRepository.save(board);

    const defaultColumns = [
      { title: 'Pendente', order: 0, color: '#ef4444', boardId: savedBoard.id, tenantId, ticketStatus: TicketStatus.OPEN },
      { title: 'A Fazer', order: 1, color: '#f59e0b', boardId: savedBoard.id, tenantId, ticketStatus: TicketStatus.IN_PROGRESS },
      { title: 'Análise', order: 2, color: '#3b82f6', boardId: savedBoard.id, tenantId, ticketStatus: TicketStatus.WAITING },
      { title: 'Desenvolvimento', order: 3, color: '#8b5cf6', boardId: savedBoard.id, tenantId, ticketStatus: TicketStatus.IN_PROGRESS },
      { title: 'Finalizado', order: 4, color: '#22c55e', boardId: savedBoard.id, tenantId, ticketStatus: TicketStatus.CLOSED },
    ];

    for (const colData of defaultColumns) {
      const column = this.columnsRepository.create(colData);
      await this.columnsRepository.save(column);
    }

    return savedBoard;
  }

  async updateBoard(id: string, data: Partial<UpdateKanbanBoardDto>): Promise<KanbanBoard> {
    const board = await this.boardsRepository.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Quadro não encontrado');
    Object.assign(board, data);
    return this.boardsRepository.save(board);
  }

  async deleteBoard(id: string): Promise<void> {
    const columns = await this.columnsRepository.find({ where: { boardId: id } });
    for (const col of columns) {
      await this.cardsRepository.delete({ columnId: col.id });
    }
    await this.columnsRepository.delete({ boardId: id });
    await this.boardsRepository.delete({ id });
  }

  async findAllColumns(tenantId: string): Promise<KanbanColumn[]> {
    return this.columnsRepository.find({ where: { tenantId }, order: { order: 'ASC' } });
  }

  async findColumnsByBoard(boardId: string): Promise<KanbanColumn[]> {
    return this.columnsRepository.find({ where: { boardId }, order: { order: 'ASC' } });
  }

  async createColumn(tenantId: string, data: CreateKanbanColumnDto): Promise<KanbanColumn> {
    const column = this.columnsRepository.create({ ...data, tenantId });
    return this.columnsRepository.save(column);
  }

  async updateColumn(id: string, data: Partial<CreateKanbanColumnDto>): Promise<KanbanColumn> {
    const column = await this.columnsRepository.findOne({ where: { id } });
    if (!column) throw new NotFoundException('Coluna não encontrada');
    Object.assign(column, data);
    return this.columnsRepository.save(column);
  }

  async deleteColumn(id: string): Promise<void> {
    const column = await this.columnsRepository.findOne({
      where: { id },
      relations: ['board']
    });
    if (!column) return;

    const remainingColumns = await this.columnsRepository.find({
      where: { boardId: column.boardId },
      order: { order: 'ASC' }
    });

    if (remainingColumns.length <= 1) {
      throw new BadRequestException('Cannot delete the last column of a board');
    }

    const currentIndex = remainingColumns.findIndex(c => c.id === id);
    let targetColumn: KanbanColumn;

    if (currentIndex < remainingColumns.length - 1) {
      targetColumn = remainingColumns[currentIndex + 1];
    } else {
      targetColumn = remainingColumns[currentIndex - 1];
    }

    await this.cardsRepository.update(
      { columnId: id },
      { columnId: targetColumn.id }
    );

    await this.columnsRepository.delete({ id });

    const updatedColumns = await this.columnsRepository.find({
      where: { boardId: column.boardId },
      order: { order: 'ASC' }
    });
    for (let i = 0; i < updatedColumns.length; i++) {
      await this.columnsRepository.update(updatedColumns[i].id, { order: i });
    }
  }

  async reorderColumns(boardId: string, columnIds: string[]): Promise<KanbanColumn[]> {
    const queries = columnIds.map((id, index) =>
      this.columnsRepository.update(id, { order: index })
    );
    await Promise.all(queries);
    return this.findColumnsByBoard(boardId);
  }

  async findAllCards(tenantId: string): Promise<KanbanCard[]> {
    return this.cardsRepository.find({ where: { tenantId }, order: { order: 'ASC' } });
  }

  async createCard(tenantId: string, data: CreateKanbanCardDto): Promise<KanbanCard> {
    if (data.tags) {
      data.tags = data.tags.map((tag: any) => {
        if (typeof tag === 'object' && tag !== null) {
          const label = tag.label || tag.name || String(tag);
          return { label: label === '[object Object]' ? 'Geral' : label, colorClass: tag.colorClass || 'bg-slate-100 text-slate-700' };
        }
        const label = String(tag);
        return { label: label === '[object Object]' ? 'Geral' : label, colorClass: 'bg-slate-100 text-slate-700' };
      });
    }
    const card = this.cardsRepository.create({ ...data, tenantId });
    const savedCard = await this.cardsRepository.save(card);
    this.eventEmitter.emit('kanban.card.created', savedCard);
    return savedCard;
  }

  async updateCard(id: string, data: Partial<CreateKanbanCardDto>): Promise<KanbanCard> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException(`Card #${id} não encontrado`);

    if (data.tags) {
      data.tags = data.tags.map((tag: any) => {
        if (typeof tag === 'object' && tag !== null) {
          const label = tag.label || tag.name || String(tag);
          if (label === '[object Object]' || label === '[Sem Tag]') {
            return { label: 'Geral', colorClass: 'bg-slate-100 text-slate-700' };
          }
          return { label, colorClass: tag.colorClass || 'bg-slate-100 text-slate-700' };
        }
        const label = String(tag);
        return { label: label === '[object Object]' ? 'Geral' : label, colorClass: 'bg-slate-100 text-slate-700' };
      });
    }

    const oldBoardId = card.boardId;
    Object.assign(card, data);

    if (data.boardId && data.boardId !== oldBoardId) {
      const firstCol = await this.columnsRepository.findOne({
        where: { boardId: data.boardId },
        order: { order: 'ASC' }
      });
      if (firstCol) {
        card.columnId = firstCol.id;
      }
    }

    const updatedCard = await this.cardsRepository.save(card);
    await this.eventEmitter.emitAsync('kanban.card.updated', updatedCard);
    return updatedCard;
  }

  async deleteCard(id: string): Promise<void> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (card?.ticketId) {
      try {
        const ticketsRepo = this.cardsRepository.manager.getRepository(Ticket);
        const ticket = await ticketsRepo.findOne({ where: { id: card.ticketId } });
        if (ticket) {
          await ticketsRepo.remove(ticket);
        }
      } catch (e) {
        this.logger.warn(`Failed to delete associated ticket ${card.ticketId}: ${e.message}`);
      }
    }
    await this.cardsRepository.delete({ id });
  }

  async moveCard(id: string, targetColumnId: string, targetOrder: number): Promise<KanbanCard> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Card não encontrado');

    const targetColumn = await this.columnsRepository.findOne({ where: { id: targetColumnId } });
    if (!targetColumn) throw new NotFoundException('Coluna de destino não encontrada');

    const oldColumnId = card.columnId;
    card.columnId = targetColumnId;
    card.boardId = targetColumn.boardId;
    card.order = targetOrder;

    const savedCard = await this.cardsRepository.save(card);
    await this.eventEmitter.emitAsync('kanban.card.updated', savedCard);

    return savedCard;
  }

  async reorderCardsInColumn(columnId: string, cardIds: string[]): Promise<void> {
    const queries = cardIds.map((id, index) =>
      this.cardsRepository.update(id, { order: index, columnId })
    );
    await Promise.all(queries);
  }

 
  static normalizeStatus(status: string): TicketStatus {
    if (!status) return TicketStatus.OPEN;
    const s = status.toLowerCase().trim();
    if (s === 'open' || s.includes('pendente')) return TicketStatus.OPEN;
    if (s === 'in_progress' || s.includes('fazer') || s.includes('progress') || s.includes('desenvolvimento')) return TicketStatus.IN_PROGRESS;
    if (s === 'waiting' || s.includes('análise') || s.includes('analise')) return TicketStatus.WAITING;
    if (s === 'resolved' || s.includes('resolvido') || s.includes('finalizado')) return TicketStatus.RESOLVED;
    if (s === 'closed' || s.includes('concluído') || s.includes('concluido')) return TicketStatus.CLOSED;
    return TicketStatus.OPEN;
  }

  private mapTicketStatusToColumnTitle(ticketStatus: TicketStatus): string {
    const mapping: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: 'Pendente',
      [TicketStatus.IN_PROGRESS]: 'Desenvolvimento',
      [TicketStatus.WAITING]: 'Análise',
      [TicketStatus.RESOLVED]: 'Finalizado',
      [TicketStatus.CLOSED]: 'Finalizado',
    };
    return mapping[ticketStatus] || 'Pendente';
  }

  private mapColumnTitleToTicketStatus(columnTitle: string): TicketStatus {
    const title = columnTitle.toLowerCase();
    if (title.includes('pendente') || title.includes('open')) return TicketStatus.OPEN;
    if (title.includes('fazer') || title.includes('progress') || title.includes('desenvolvimento')) return TicketStatus.IN_PROGRESS;
    if (title.includes('análise') || title.includes('analise') || title.includes('waiting')) return TicketStatus.WAITING;
    if (title.includes('resolvido') || title.includes('resolved') || title.includes('finalizado')) return TicketStatus.RESOLVED;
    if (title.includes('closed') || title.includes('concluído') || title.includes('concluido')) return TicketStatus.CLOSED;
    return TicketStatus.OPEN;
  }

  @OnEvent('ticket.created')
  async handleTicketCreated(ticket: any) {
    this.logger.log(`Syncing new ticket to kanban card: ${ticket.id}`);
    try {
      const existing = await this.cardsRepository.findOne({ where: { ticketId: ticket.id } });
      if (existing) return;

      let boardId = ticket.boardId;
      if (!boardId) {
        const boards = await this.boardsRepository.find({ where: { tenantId: ticket.tenantId }, order: { order: 'ASC' } });
        if (boards.length === 0) return;
        boardId = boards[0].id;
      }

      const cols = await this.columnsRepository.find({ where: { boardId } });
      let col = cols.find(c => c.ticketStatus === ticket.status);
      if (!col) col = cols[0];
      if (!col) return;

      const formattedTags = (ticket.tags || []).map((t: any) => ({
        label: t.name || t.label || 'Geral',
        colorClass: t.color || 'bg-slate-100 text-slate-700'
      }));

      const card = this.cardsRepository.create({
        title: ticket.title,
        description: ticket.description,
        tenantId: ticket.tenantId,
        boardId,
        columnId: col.id,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        customerId: ticket.customerId,
        priority: ticket.priority,
        type: ticket.type,
        assignees: ticket.assignees || [],
        estimatedHours: ticket.estimatedHours,
        tags: formattedTags,
        checklist: ticket.checklist || []
      });

      await this.cardsRepository.save(card);
    } catch (e) {
      this.logger.warn(`Failed to create card from ticket ${ticket.id}: ${e.message}`);
    }
  }

  @OnEvent('ticket.updated')
  async handleTicketUpdated(ticket: any) {
    if (ticket._skipKanbanSync) return;
    this.logger.log(`Syncing ticket update to kanban card: ${ticket.id}`);
    try {
      const card = await this.cardsRepository.findOne({ where: { ticketId: ticket.id } });
      if (!card) return;

      const formattedTags = (ticket.tags || []).map((t: any) => ({
        label: t.name || t.label || 'Geral',
        colorClass: t.color || 'bg-slate-100 text-slate-700'
      }));

     
      const targetBoardId = ticket.boardId || card.boardId;
      const boardChanged = targetBoardId !== card.boardId;

      if (boardChanged) {
        card.boardId = targetBoardId;
        this.logger.log(`Board changed to: ${targetBoardId}`);
      }

     
      let targetColumnId = null;

      if (ticket.kanbanColumnId) {
        const targetCol = await this.columnsRepository.findOne({ where: { id: ticket.kanbanColumnId } });
        if (targetCol && targetCol.boardId === card.boardId) {
          targetColumnId = targetCol.id;
          this.logger.log(`Using provided kanbanColumnId: ${targetCol.id}`);
        }
      }

      if (!targetColumnId) {
        const newCol = await this.columnsRepository.findOne({
          where: { boardId: card.boardId, ticketStatus: ticket.status }
        });
        if (newCol) {
          targetColumnId = newCol.id;
          this.logger.log(`Using column by status: ${newCol.title}`);
        }
      }

      if (!targetColumnId) {
        const fallbackCol = await this.columnsRepository.findOne({
          where: { boardId: card.boardId },
          order: { order: 'ASC' }
        });
        if (fallbackCol) {
          targetColumnId = fallbackCol.id;
          this.logger.log(`Using fallback column: ${fallbackCol.title}`);
        }
      }

      if (targetColumnId) {
        card.columnId = targetColumnId;
      }

     
      if (!boardChanged && !targetColumnId) {
        const col = await this.columnsRepository.findOne({ where: { id: card.columnId } });
        if (col && col.ticketStatus !== ticket.status) {
          const newCol = await this.columnsRepository.findOne({
            where: { boardId: card.boardId, ticketStatus: ticket.status }
          });
          if (newCol) {
            card.columnId = newCol.id;
          }
        }
      }

      card.title = ticket.title;
      card.description = ticket.description;
      card.customerId = ticket.customerId;
      card.priority = ticket.priority;
      card.type = ticket.type;
      card.assignees = ticket.assignees || [];
      card.estimatedHours = ticket.estimatedHours;
      card.tags = formattedTags;
      card.checklist = ticket.checklist || [];

      await this.cardsRepository.save(card);
    } catch (e) {
      this.logger.warn(`Failed to update card from ticket ${ticket.id}: ${e.message}`);
    }
  }
}
