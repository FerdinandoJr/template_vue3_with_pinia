import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerSource } from '../data/customer-source.entity';

@Injectable()
export class CustomerSourceService {
  constructor(
    @InjectRepository(CustomerSource)
    private customerSourceRepository: Repository<CustomerSource>,
  ) {}

  async findAll(tenantId: string): Promise<CustomerSource[]> {
    return this.customerSourceRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, tenantId?: string): Promise<CustomerSource | null> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    return this.customerSourceRepository.findOne({ where });
  }

  async create(tenantId: string, name: string): Promise<CustomerSource> {
    const source = this.customerSourceRepository.create({ name, tenantId });
    return this.customerSourceRepository.save(source);
  }

  async update(id: string, tenantId: string, name: string): Promise<CustomerSource> {
    const source = await this.findById(id, tenantId);
    if (!source) {
      throw new NotFoundException('Origem não encontrada');
    }
    source.name = name;
    return this.customerSourceRepository.save(source);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const source = await this.findById(id, tenantId);
    if (!source) {
      throw new NotFoundException('Origem não encontrada');
    }
    await this.customerSourceRepository.remove(source);
  }
}