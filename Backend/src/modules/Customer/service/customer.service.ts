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

  async findAll(tenantId: string, query?: string): Promise<Customer[]> {
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
    return qb.getMany();
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customersRepository.findOne({ where: { id } });
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

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    
    if (data.name !== undefined) customer.name = data.name;
    if (data.email !== undefined) customer.email = data.email;
    if (data.phone !== undefined) customer.phone = data.phone;
    if (data.document !== undefined) customer.document = data.document;
    if (data.type !== undefined) customer.type = data.type;
    if (data.companyName !== undefined) customer.companyName = data.companyName;
    if (data.tradeName !== undefined) customer.tradeName = data.tradeName;
    if (data.responsibleName !== undefined) customer.responsibleName = data.responsibleName;
    if (data.website !== undefined) customer.website = data.website;
    if (data.status !== undefined) customer.status = data.status as CustomerStatus;
    if (data.source !== undefined) customer.source = data.source as any;
    if (data.zipCode !== undefined) customer.zipCode = data.zipCode;
    if (data.street !== undefined) customer.street = data.street;
    if (data.number !== undefined) customer.number = data.number;
    if (data.complement !== undefined) customer.complement = data.complement;
    if (data.neighborhood !== undefined) customer.neighborhood = data.neighborhood;
    if (data.city !== undefined) customer.city = data.city;
    if (data.state !== undefined) customer.state = data.state;
    if (data.avatar !== undefined) customer.avatar = data.avatar;
    
    return this.customersRepository.save(customer);
  }

  async delete(id: string): Promise<void> {
    const customer = await this.findById(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    await this.customersRepository.remove(customer);
  }
}