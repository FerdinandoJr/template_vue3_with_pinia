import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn, KanbanCard } from '../data/kanban.entity';
import { CreateKanbanColumnDto, CreateKanbanCardDto } from '../dto/create-kanban.dto';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(KanbanColumn)
    private columnsRepository: Repository<KanbanColumn>,
    @InjectRepository(KanbanCard)
    private cardsRepository: Repository<KanbanCard>,
  ) {}

  async findAllColumns(tenantId: string): Promise<KanbanColumn[]> {
    return this.columnsRepository.find({ where: { tenantId }, order: { order: 'ASC' } });
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
    await this.cardsRepository.delete({ columnId: id });
    await this.columnsRepository.delete({ id });
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