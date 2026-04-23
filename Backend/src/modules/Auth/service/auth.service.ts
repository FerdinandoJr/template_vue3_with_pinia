import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../../Users/service/users.service';
import { UserPermissionsService } from '../../Users/service/user-permissions.service';
import { TenantsService } from '../../Tenants/service/tenants.service';
import { CustomerSourceService } from '../../Customer/service/customer-source.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto, RequestVerificationDto, VerifyEmailDto } from '../dto/register.dto';
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

const ROLE_PERMISSIONS_TEMPLATES: Record<string, Record<string, any>> = {
  [UserRole.ADMIN]: {
    customer: { active: true, features: { create: true, edit: true, delete: true } },
    atendimentos: { active: true, features: { create_ticket: true, edit_ticket: true, delete_ticket: true } },
    chats: { active: true, features: { take_over: true, transfer_chat: true, finish_chat: true } },
    kanban: { active: true, features: { move_cards: true, edit_cards: true } },
    calendar: { active: true, features: { create_event: true, edit_event: true, delete_event: true } },
    relatorios: { active: true, features: { view_metrics: true } },
    kb: { active: true, features: { create_article: true, edit_article: true, delete_article: true } },
    monitor: { active: true, features: { view_dashboard: true } },
  },
  [UserRole.MANAGER]: {
    customer: { active: true, features: { create: true, edit: true, delete: true } },
    atendimentos: { active: true, features: { create_ticket: true, edit_ticket: true, delete_ticket: true } },
    chats: { active: true, features: { take_over: true, transfer_chat: true, finish_chat: true } },
    kanban: { active: true, features: { move_cards: true, edit_cards: true } },
    calendar: { active: true, features: { create_event: true, edit_event: true, delete_event: true } },
    relatorios: { active: true, features: { view_metrics: true } },
    kb: { active: true, features: { create_article: true, edit_article: true, delete_article: true } },
    monitor: { active: true, features: { view_dashboard: true } },
  },
  [UserRole.AGENT]: {
    customer: { active: true, features: { create: true, edit: true, delete: false } },
    atendimentos: { active: true, features: { create_ticket: true, edit_ticket: true, delete_ticket: false } },
    chats: { active: true, features: { take_over: true, transfer_chat: false, finish_chat: true } },
    kanban: { active: true, features: { move_cards: true, edit_cards: true } },
    calendar: { active: true, features: { create_event: true, edit_event: true, delete_event: true } },
    relatorios: { active: true, features: { view_metrics: true } },
    kb: { active: true, features: { create_article: false, edit_article: false, delete_article: false } },
    monitor: { active: false, features: { view_dashboard: false } },
  },
  [UserRole.CUSTOMER]: {
    customer: { active: true, features: { create: false, edit: false, delete: false } },
    atendimentos: { active: true, features: { create_ticket: false, edit_ticket: false, delete_ticket: false } },
    chats: { active: false, features: { take_over: false, transfer_chat: false, finish_chat: false } },
    kanban: { active: false, features: { move_cards: false, edit_cards: false } },
    calendar: { active: false, features: { create_event: false, edit_event: false, delete_event: false } },
    relatorios: { active: false, features: { view_metrics: false } },
    kb: { active: true, features: { create_article: false, edit_article: false, delete_article: false } },
    monitor: { active: false, features: { view_dashboard: false } },
  },
};

const getDefaultPermissions = (role: string): Record<string, any> => {
  return ROLE_PERMISSIONS_TEMPLATES[role] || ROLE_PERMISSIONS_TEMPLATES[UserRole.ADMIN];
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private userPermissionsService: UserPermissionsService,
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
    
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email não verificado. Verifique sua caixa de entrada ou solicite um novo código.');
    }

    const tenant = await this.tenantsService.findById(user.tenantId);
    if (!tenant) {
      throw new UnauthorizedException('Empresa não encontrada. Entre em contato com o administrador.');
    }
    
    if (!tenant.isActive) {
      throw new UnauthorizedException('Empresa desativada. Entre em contato com o administrador.');
    }

    // Buscar permissões do usuário
    let userPermissions = await this.userPermissionsService.findByUserId(user.id);
    let permissions = userPermissions?.permissions || null;
    
    // Se não tem permissões salvas, usar template basedo no role
    if (!permissions || Object.keys(permissions).length === 0) {
      permissions = getDefaultPermissions(user.role);
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
        permissions,
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
    
    const result = await this.usersService.create(userData);
    const user = result.user;
    
    const defaultPermissions = getDefaultPermissions(user.role);
    await this.userPermissionsService.upsert(user.id, defaultPermissions);
    
    console.log(`[REGISTER] User created for ${registerDto.email}, token: ${result.token}`);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      pendingVerification: true,
      token: result.token,
      message: 'Conta criada. Verifique o token para ativar.',
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async requestVerification(requestDto: RequestVerificationDto) {
    const user = await this.usersService.findByEmail(requestDto.email);
    if (!user) {
      throw new BadRequestException('Email não encontrado');
    }
    
    const token = crypto.randomBytes(6).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    await this.usersService.update(user.id, {
      verificationToken: token,
      verificationTokenExpires: expiresAt,
    });
    
    return {
      token,
      expiresAt: expiresAt.toISOString(),
      message: 'Token enviado para o email',
    };
  }

  async verifyEmail(verifyDto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(verifyDto.email);
    if (!user) {
      throw new BadRequestException('Email não encontrado');
    }
    
    if (!verifyDto.token || verifyDto.token.length !== 6) {
      throw new BadRequestException('Token inválido');
    }
    
    if (user.verificationToken !== verifyDto.token) {
      throw new BadRequestException('Token incorreto');
    }
    
    if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
      throw new BadRequestException('Token expirado. Solicite um novo código.');
    }
    
    await this.usersService.update(user.id, {
      emailVerified: true,
      isActive: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });
    
    return {
      verified: true,
      message: 'Email verificado! Agora você pode fazer login.',
    };
  }
}