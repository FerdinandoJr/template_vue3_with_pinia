import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../database/postgres/user.entity';
import { RolesService } from '../../Roles/service/roles.service';

function generateVerificationToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService,
  ) {}

  async findAll(tenantId: string): Promise<User[]> {
    console.log('[UsersService] findAll called with tenantId:', tenantId);
    const users = await this.usersRepository.find({ where: { tenantId } });
    console.log('[UsersService] found users:', users.length);
    return users;
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
      select: ['id', 'name', 'email', 'password', 'tenantId', 'isActive', 'emailVerified', 'verificationToken', 'verificationTokenExpires'],
    });
  }

  async create(data: Partial<User> & { skipVerification?: boolean }): Promise<{ user: User; token: string }> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    const token = generateVerificationToken();
    const tokenExpires = new Date();
    tokenExpires.setMinutes(tokenExpires.getMinutes() + 30);
    
    const isActive = data.skipVerification ?? false;
    
    const user = this.usersRepository.create({
      ...data,
      verificationToken: isActive ? null : token,
      verificationTokenExpires: isActive ? null : tokenExpires,
      isActive,
      emailVerified: isActive,
    });
    
    const savedUser = await this.usersRepository.save(user);

    const roles = await this.rolesService.findAllRoles();
    const clientRole = roles.find(r => r.name.toLowerCase() === 'cliente');
    if (clientRole && savedUser.tenantId) {
      await this.rolesService.assignRoleToUser(savedUser.id, clientRole.id, savedUser.tenantId);
    }
    
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