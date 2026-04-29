import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn, KanbanCard, KanbanBoard } from '../data/kanban.entity';
import { CreateKanbanColumnDto, CreateKanbanCardDto, CreateKanbanBoardDto, UpdateKanbanBoardDto } from '../dto/create-kanban.dto';
import { Ticket, TicketStatus } from '../../Tickets/data/ticket.entity';

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
  ) {}

  async findAllBoards(tenantId: string): Promise<KanbanBoard[]> {
    return this.boardsRepository.find({ where: { tenantId }, order: { createdAt: 'ASC' } });
  }

  async createBoard(tenantId: string, data: CreateKanbanBoardDto): Promise<KanbanBoard> {
    const board = this.boardsRepository.create({ ...data, tenantId });
    const savedBoard = await this.boardsRepository.save(board);

    const defaultColumns = [
      { title: 'Pendente', order: 0, color: '#ef4444', boardId: savedBoard.id, tenantId },
      { title: 'A Fazer', order: 1, color: '#f59e0b', boardId: savedBoard.id, tenantId },
      { title: 'Análise', order: 2, color: '#3b82f6', boardId: savedBoard.id, tenantId },
      { title: 'Desenvolvimento', order: 3, color: '#8b5cf6', boardId: savedBoard.id, tenantId },
      { title: 'Finalizado', order: 4, color: '#22c55e', boardId: savedBoard.id, tenantId },
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
    this.logger.log(`Iniciando deleteBoard para id: ${id}`);
    
    const columns = await this.columnsRepository.find({ where: { boardId: id } });
    this.logger.log(`Colunas encontradas: ${columns.length}`);
    
    for (const col of columns) {
      this.logger.log(`Deletando cards da coluna: ${col.id}`);
      await this.cardsRepository.delete({ columnId: col.id });
    }
    
    this.logger.log(`Deletando colunas do board: ${id}`);
    await this.columnsRepository.delete({ boardId: id });
    
    this.logger.log(`Deletando board: ${id}`);
    await this.boardsRepository.delete({ id });
    
    this.logger.log(`deleteBoard concluído para id: ${id}`);
  }

  async findAllColumns(tenantId: string): Promise<KanbanColumn[]> {
    const columns = await this.columnsRepository.find({ 
      where: { tenantId }, 
      order: { order: 'ASC' } 
    });
    return columns;
  }

  async findColumnsByBoard(boardId: string): Promise<KanbanColumn[]> {
    return this.columnsRepository.find({ 
      where: { boardId }, 
      order: { order: 'ASC' } 
    });
  }

  async findAllCards(tenantId: string): Promise<KanbanCard[]> {
    return this.cardsRepository.find({ where: { tenantId }, order: { order: 'ASC' } });
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
    await this.columnsRepository.delete({ id });
  }

  async reorderColumns(boardId: string, columnIds: string[]): Promise<KanbanColumn[]> {
    const queries = columnIds.map((id, index) => 
      this.columnsRepository.update(id, { order: index })
    );
    await Promise.all(queries);
    return this.findColumnsByBoard(boardId);
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
    return this.cardsRepository.save(card);
  }

  async updateCard(id: string, data: Partial<CreateKanbanCardDto>): Promise<KanbanCard> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Card não encontrado');
    
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
    
    Object.assign(card, data);
    return this.cardsRepository.save(card);
  }

  async deleteCard(id: string): Promise<void> {
    await this.cardsRepository.delete({ id });
  }

  async moveCard(id: string, targetColumnId: string, targetOrder: number): Promise<KanbanCard> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Card não encontrado');
    
    const targetColumn = await this.columnsRepository.findOne({ where: { id: targetColumnId } });
    if (!targetColumn) throw new NotFoundException('Coluna de destino não encontrada');
    
    card.columnId = targetColumnId;
    card.boardId = targetColumn.boardId;
    card.order = targetOrder;
    
    const savedCard = await this.cardsRepository.save(card);
    
    this.logger.log(`Card ${id} movido para coluna ${targetColumnId} na posição ${targetOrder}`);
    
    return savedCard;
  }

  async reorderCardsInColumn(columnId: string, cardIds: string[]): Promise<void> {
    const queries = cardIds.map((id, index) =>
      this.cardsRepository.update(id, { order: index, columnId })
    );
    await Promise.all(queries);
  }

  async syncCardFromTicket(ticketId: string, ticketStatus: TicketStatus): Promise<KanbanCard | null> {
    const card = await this.cardsRepository.findOne({ where: { ticketId } });
    if (!card) {
      this.logger.warn(`Card não encontrado para ticketId: ${ticketId}`);
      return null;
    }

    const column = await this.columnsRepository.findOne({ where: { id: card.columnId } });
    if (!column) return card;

    const newStatus = this.mapTicketStatusToColumnTitle(ticketStatus);
    
    if (column.title !== newStatus) {
      const targetColumn = await this.columnsRepository.findOne({
        where: { boardId: card.boardId, title: newStatus }
      });
      
      if (targetColumn) {
        card.columnId = targetColumn.id;
        await this.cardsRepository.save(card);
        this.logger.log(`Card sincronizado: ticket ${ticketId} → coluna ${newStatus}`);
      }
    }

    return card;
  }

  async syncTicketFromCard(cardId: string): Promise<{ ticketId: string; status: TicketStatus } | null> {
    const card = await this.cardsRepository.findOne({ where: { id: cardId } });
    if (!card || !card.ticketId) {
      return null;
    }

    const column = await this.columnsRepository.findOne({ where: { id: card.columnId } });
    if (!column) {
      return null;
    }

    const ticketStatus = this.mapColumnTitleToTicketStatus(column.title);
    
    return {
      ticketId: card.ticketId,
      status: ticketStatus,
    };
  }

  async findCardByTicketId(ticketId: string): Promise<KanbanCard | null> {
    return this.cardsRepository.findOne({ where: { ticketId } });
  }

  private mapTicketStatusToColumnTitle(ticketStatus: TicketStatus): string {
    const mapping: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: 'Pendente',
      [TicketStatus.IN_PROGRESS]: 'A Fazer',
      [TicketStatus.WAITING]: 'Análise',
      [TicketStatus.RESOLVED]: 'Desenvolvimento',
      [TicketStatus.CLOSED]: 'Finalizado',
    };
    return mapping[ticketStatus] || 'Pendente';
  }

  private mapColumnTitleToTicketStatus(columnTitle: string): TicketStatus {
    const title = columnTitle.toLowerCase();
    
    if (title.includes('pendente') || title.includes('open')) return TicketStatus.OPEN;
    if (title.includes('fazer') || title.includes('progress')) return TicketStatus.IN_PROGRESS;
    if (title.includes('análise') || title.includes('waiting')) return TicketStatus.WAITING;
    if (title.includes('desenvolvimento') || title.includes('resolved')) return TicketStatus.RESOLVED;
    if (title.includes('finalizado') || title.includes('closed')) return TicketStatus.CLOSED;
    
    return TicketStatus.OPEN;
  }
}