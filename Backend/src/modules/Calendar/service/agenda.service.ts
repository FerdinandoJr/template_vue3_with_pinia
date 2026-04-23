import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agenda } from '../data/agenda.entity';
import { CreateAgendaDto } from '../dto/create-agenda.dto';
import { UpdateAgendaDto } from '../dto/update-agenda.dto';
import { AgendaQueryDto } from '../dto/agenda-query.dto';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(Agenda)
    private agendaRepository: Repository<Agenda>,
  ) {}

  async findAll(tenantId: string, query?: AgendaQueryDto): Promise<Agenda[]> {
    const qb = this.agendaRepository.createQueryBuilder('agenda')
      .leftJoinAndSelect('agenda.creator', 'creator')
      .where('agenda.tenantId = :tenantId', { tenantId });

    if (query?.type) qb.andWhere('agenda.type = :type', { type: query.type });
    if (query?.customerId) qb.andWhere('agenda.customerId = :customerId', { customerId: query.customerId });
    if (query?.assignedTo) qb.andWhere('agenda.assignedTo = :assignedTo', { assignedTo: query.assignedTo });
    if (query?.startDate) qb.andWhere('agenda.startDate >= :startDate', { startDate: query.startDate });
    if (query?.endDate) qb.andWhere('agenda.endDate <= :endDate', { endDate: query.endDate });

    return qb.orderBy('agenda.startDate', 'ASC').getMany();
  }

  async findById(id: string): Promise<Agenda | null> {
    return this.agendaRepository.findOne({ where: { id }, relations: ['creator'] });
  }

  async create(tenantId: string, data: CreateAgendaDto, userId?: string): Promise<Agenda> {
    const agenda = this.agendaRepository.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      tenantId,
      createdBy: userId,
    });
    return this.agendaRepository.save(agenda);
  }

  async update(id: string, data: UpdateAgendaDto): Promise<Agenda> {
    const agenda = await this.findById(id);
    if (!agenda) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (data.startDate) data.startDate = new Date(data.startDate as any) as any;
    if (data.endDate) data.endDate = new Date(data.endDate as any) as any;
    Object.assign(agenda, data);
    return this.agendaRepository.save(agenda);
  }

  async delete(id: string): Promise<void> {
    const agenda = await this.findById(id);
    if (!agenda) {
      throw new NotFoundException('Evento não encontrado');
    }
    await this.agendaRepository.remove(agenda);
  }
}