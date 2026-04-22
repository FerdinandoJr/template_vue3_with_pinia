import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../../database/postgres/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return this.tenantsRepository.find();
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({ where: { id } });
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.tenantsRepository.findOne({ where: { domain } });
  }

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantsRepository.create(data);
    return this.tenantsRepository.save(tenant);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }
    Object.assign(tenant, data);
    return this.tenantsRepository.save(tenant);
  }

  async delete(id: string): Promise<void> {
    const tenant = await this.findById(id);
    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }
    await this.tenantsRepository.remove(tenant);
  }
}