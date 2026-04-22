import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../Users/service/users.service';
import { TenantsService } from '../../Tenants/service/tenants.service';
import { CustomerSourceService } from '../../Customer/service/customer-source.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { UserRole } from '../../../database/postgres/user.entity';

const DEFAULT_CUSTOMER_SOURCES = [
  'WhatsApp',
  'Site / Landing Page',
  'Indicação',
  'Instagram',
  'Facebook',
  'Google',
  'Outro',
];

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tenantsService: TenantsService,
    private customerSourceService: CustomerSourceService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário desativado. Entre em contato com o administrador.');
    }

    const tenant = await this.tenantsService.findById(user.tenantId);
    if (!tenant) {
      throw new UnauthorizedException('Empresa não encontrada. Entre em contato com o administrador.');
    }
    
    if (!tenant.isActive) {
      throw new UnauthorizedException('Empresa desativada. Entre em contato com o administrador.');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      tenantId: user.tenantId,
      role: user.role,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    let tenantId = registerDto.tenantId;
    
    if (!tenantId) {
      const tenant = await this.tenantsService.create({
        name: registerDto.name + ' Company',
        domain: registerDto.email.split('@')[1] || 'company.com',
      });
      tenantId = tenant.id;

      for (const name of DEFAULT_CUSTOMER_SOURCES) {
        await this.customerSourceService.create(tenantId, name);
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const userData = {
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role as UserRole || UserRole.ADMIN,
      tenantId,
    };
    
    const user = await this.usersService.create(userData);

    const { password, ...result } = user;
    return result;
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}