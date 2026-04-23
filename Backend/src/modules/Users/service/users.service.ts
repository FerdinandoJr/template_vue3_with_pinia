import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../database/postgres/user.entity';

function generateVerificationToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
      select: ['id', 'name', 'email', 'password', 'role', 'tenantId', 'isActive', 'emailVerified', 'verificationToken', 'verificationTokenExpires'],
    });
  }

  async create(data: Partial<User>): Promise<{ user: User; token: string }> {
    if (data.role) {
      data.role = data.role.toLowerCase() as any;
    }
    
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    const token = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 30);
    
    const user = this.usersRepository.create({
      ...data,
      verificationToken: token,
      verificationTokenExpires: tokenExpires,
      isActive: false,
      emailVerified: false,
    });
    
    const savedUser = await this.usersRepository.save(user);
    
    return { user: savedUser, token };
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
}