import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn, KanbanCard, KanbanBoard } from '../data/kanban.entity';
import { CreateKanbanColumnDto, CreateKanbanCardDto, CreateKanbanBoardDto, UpdateKanbanBoardDto } from '../dto/create-kanban.dto';

@Injectable()
export class KanbanService {
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
      { title: 'A Fazer', order: 0, color: '#f59e0b', boardId: savedBoard.id, tenantId },
      { title: 'Análise', order: 1, color: '#3b82f6', boardId: savedBoard.id, tenantId },
      { title: 'Desenvolvimento', order: 2, color: '#8b5cf6', boardId: savedBoard.id, tenantId },
      { title: 'Teste', order: 3, color: '#06b6d4', boardId: savedBoard.id, tenantId },
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
    await this.boardsRepository.delete({ id });
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
    return this.cardsRepository.find({ order: { order: 'ASC' } });
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
    const card = this.cardsRepository.create({ ...data, tenantId });
    return this.cardsRepository.save(card);
  }

  async updateCard(id: string, data: Partial<CreateKanbanCardDto>): Promise<KanbanCard> {
    const card = await this.cardsRepository.findOne({ where: { id } });
    if (!card) throw new NotFoundException('Card não encontrado');
    Object.assign(card, data);
    return this.cardsRepository.save(card);
  }

  async deleteCard(id: string): Promise<void> {
    await this.cardsRepository.delete({ id });
  }
}