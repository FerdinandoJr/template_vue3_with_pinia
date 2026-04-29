import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRecord, ServiceRecordStatus } from '../data/service-record.entity';
import { CreateServiceRecordDto, UpdateServiceRecordDto, ServiceRecordQueryDto } from '../dto/service-record.dto';

@Injectable()
export class ServiceRecordsService {
  constructor(
    @InjectRepository(ServiceRecord)
    private readonly serviceRecordRepository: Repository<ServiceRecord>,
  ) {}

  async findAll(query: ServiceRecordQueryDto, tenantId: string) {
    const { page = 1, limit = 20, status, search, attendantId } = query;
    const skip = (page - 1) * limit;

    const qb = this.serviceRecordRepository
      .createQueryBuilder('serviceRecord')
      .leftJoinAndSelect('serviceRecord.customer', 'customer')
      .leftJoinAndSelect('serviceRecord.attendant', 'attendant')
      .leftJoinAndSelect('serviceRecord.ticket', 'ticket')
      .where('serviceRecord.tenantId = :tenantId', { tenantId });

    if (status) {
      qb.andWhere('serviceRecord.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(serviceRecord.subject ILIKE :search OR serviceRecord.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (attendantId) {
      qb.andWhere('serviceRecord.attendantId = :attendantId', { attendantId });
    }

    qb.orderBy('serviceRecord.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, tenantId: string) {
    const serviceRecord = await this.serviceRecordRepository.findOne({
      where: { id, tenantId },
      relations: ['customer', 'attendant', 'ticket'],
    });

    if (!serviceRecord) {
      throw new NotFoundException('Service record not found');
    }

    return serviceRecord;
  }

  async create(createDto: CreateServiceRecordDto, tenantId: string, userId: string) {
    const count = await this.serviceRecordRepository.count({ where: { tenantId } });
    const serviceNumber = `SR-${String(count + 1).padStart(5, '0')}`;

    const serviceRecord = this.serviceRecordRepository.create({
      ...createDto,
      serviceNumber,
      tenantId,
      attendantId: userId,
      status: createDto.status || ServiceRecordStatus.OPEN,
    });

    return this.serviceRecordRepository.save(serviceRecord);
  }

  async update(id: string, updateDto: UpdateServiceRecordDto, tenantId: string) {
    const serviceRecord = await this.findOne(id, tenantId);

    Object.assign(serviceRecord, updateDto);

    if (updateDto.status === ServiceRecordStatus.RESOLVED && !serviceRecord.endDate) {
      serviceRecord.endDate = new Date();
    }

    return this.serviceRecordRepository.save(serviceRecord);
  }

  async delete(id: string, tenantId: string) {
    const serviceRecord = await this.findOne(id, tenantId);
    await this.serviceRecordRepository.remove(serviceRecord);
    return { success: true };
  }

  async getCountByStatus(tenantId: string, attendantId?: string) {
    const qb = this.serviceRecordRepository
      .createQueryBuilder('serviceRecord')
      .select('serviceRecord.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('serviceRecord.tenantId = :tenantId', { tenantId });

    if (attendantId) {
      qb.andWhere('serviceRecord.attendantId = :attendantId', { attendantId });
    }

    qb.groupBy('serviceRecord.status');

    const result = await qb.getRawMany();

    const counts = {
      open: 0,
      in_progress: 0,
      waiting: 0,
      resolved: 0,
      closed: 0,
    };

    result.forEach((row) => {
      counts[row.status] = parseInt(row.count, 10);
    });

    return counts;
  }
}