import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer, CustomerStatus } from '../data/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async findAll(
    tenantId: string, 
    query?: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ data: Customer[]; total: number; filteredTotal: number }> {
    const qb = this.customersRepository.createQueryBuilder('customer')
      .where('customer.tenantId = :tenantId', { tenantId });
    
    if (query && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      qb.andWhere(
        `(customer.name ILIKE :search OR customer.companyName ILIKE :search OR customer.tradeName ILIKE :search OR customer.email ILIKE :search OR customer.document ILIKE :search)`,
        { search: searchTerm }
      );
    }
    
    qb.orderBy('customer.createdAt', 'DESC');
    
    const [data, total] = await qb.getManyAndCount();
    
    const filteredTotal = total;
    const startIndex = (page - 1) * limit;
    const paginatedData = data.slice(startIndex, startIndex + limit);
    
    return { data: paginatedData, total, filteredTotal };
  }

  async findById(id: string, tenantId?: string): Promise<Customer | null> {
    const where: any = { id };
    if (tenantId) {
      where.tenantId = tenantId;
    }
    return this.customersRepository.findOne({ where });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customersRepository.findOne({ where: { email } });
  }

  async create(tenantId: string, data: CreateCustomerDto): Promise<Customer> {
    const customer = new Customer();
    customer.name = data.name || data.companyName || '';
    customer.email = data.email;
    customer.phone = data.phone;
    customer.document = data.document;
    customer.type = data.type;
    customer.companyName = data.companyName;
    customer.tradeName = data.tradeName;
    customer.responsibleName = data.responsibleName;
    customer.website = data.website;
    customer.status = data.status as CustomerStatus || CustomerStatus.ACTIVE;
    customer.source = data.source as any;
    customer.zipCode = data.zipCode;
    customer.street = data.street;
    customer.number = data.number;
    customer.complement = data.complement;
    customer.neighborhood = data.neighborhood;
    customer.city = data.city;
    customer.state = data.state;
    customer.avatar = data.avatar;
    customer.tenantId = tenantId;
    
    return this.customersRepository.save(customer);
  }

  async update(id: string, tenantId: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id, tenantId);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    
    Object.assign(customer, data);
    
    return this.customersRepository.save(customer);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const customer = await this.findById(id, tenantId);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    await this.customersRepository.remove(customer);
  }
}