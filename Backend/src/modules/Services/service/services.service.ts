import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceHistory, ServiceStatus } from '../data/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(ServiceHistory)
    private historyRepository: Repository<ServiceHistory>,
  ) {}

  private generateProtocol(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SV${year}${random}`;
  }

  async findAll(tenantId: string): Promise<Service[]> {
    const qb = this.servicesRepository.createQueryBuilder('service');
    qb.where('service.tenantId = :tenantId', { tenantId });
    qb.orderBy('service.createdAt', 'DESC');
    return qb.getMany();
  }

  async findById(id: string): Promise<Service | null> {
    return this.servicesRepository.findOne({ 
      where: { id },
      relations: ['customer'],
    });
  }

  async findByProtocol(protocol: string): Promise<Service | null> {
    return this.servicesRepository.findOne({ where: { protocol } });
  }

  async create(tenantId: string, data: CreateServiceDto): Promise<Service> {
    const service = this.servicesRepository.create({
      ...data,
      protocol: this.generateProtocol(),
      tenantId,
    });
    const saved = await this.servicesRepository.save(service);
    
    await this.addHistory(saved.id, {
      title: 'Servico criado',
      description: `Protocolo: ${saved.protocol}`,
      author: 'Sistema',
      type: 'primary',
    });
    
    return saved;
  }

  async update(id: string, data: UpdateServiceDto): Promise<Service> {
    const service = await this.findById(id);
    if (!service) {
      throw new NotFoundException('Servico nao encontrado');
    }
    Object.assign(service, data);
    return this.servicesRepository.save(service);
  }

  async delete(id: string): Promise<void> {
    const service = await this.findById(id);
    if (!service) {
      throw new NotFoundException('Servico nao encontrado');
    }
    await this.servicesRepository.remove(service);
  }

  async addHistory(serviceId: string, data: Partial<ServiceHistory>): Promise<ServiceHistory> {
    const history = this.historyRepository.create({ ...data, serviceId });
    return this.historyRepository.save(history);
  }

  async getHistory(serviceId: string): Promise<ServiceHistory[]> {
    const qb = this.historyRepository.createQueryBuilder('history');
    qb.where('history.serviceId = :serviceId', { serviceId });
    qb.orderBy('history.date', 'DESC');
    return qb.getMany();
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const services = await this.servicesRepository.find({ where: { tenantId } });
    const counts: Record<string, number> = {
      open: 0,
      in_progress: 0,
      waiting: 0,
      resolved: 0,
      closed: 0,
    };
    services.forEach(s => {
      const status = s.status as string;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }
}