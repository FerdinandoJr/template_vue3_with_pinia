import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/postgres/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(tenantId: string): Promise<User[]> {
    return this.usersRepository.find({ where: { tenantId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { id },
      relations: ['tenant'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role', 'tenantId', 'isActive'],
    });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.usersRepository.remove(user);
  }

  async updatePermissions(id: string, permissions: Record<string, any>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    user.permissions = permissions;
    return this.usersRepository.save(user);
  }
}