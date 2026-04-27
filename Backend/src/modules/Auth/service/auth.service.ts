import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../../Users/service/users.service';
import { UserPermissionsService } from '../../Users/service/user-permissions.service';
import { TenantsService } from '../../Tenants/service/tenants.service';
import { CustomerSourceService } from '../../Customer/service/customer-source.service';
import { RolesService } from '../../Roles/service/roles.service';
import { Role } from '../../Roles/data/role.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto, RequestVerificationDto, VerifyEmailDto } from '../dto/register.dto';

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
    private userPermissionsService: UserPermissionsService,
    private jwtService: JwtService,
    private tenantsService: TenantsService,
    private customerSourceService: CustomerSourceService,
    private rolesService: RolesService,
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

    let permissions: Record<string, any>;
    const userPermissions = await this.userPermissionsService.findByUserId(user.id);
    
    if (userPermissions?.permissions && Object.keys(userPermissions.permissions).length > 0) {
      permissions = userPermissions.permissions;
    } else {
      const { permissions: rolePermissions } = await this.rolesService.getUserRolesWithPermissions(user.id);
      permissions = rolePermissions || {};
    }

    const { roles } = await this.rolesService.getUserRolesWithPermissions(user.id);
    const roleNames = roles.map(r => r.name);

    const payload = { 
      sub: user.id, 
      email: user.email, 
      tenantId: user.tenantId,
      roles: roleNames,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: roleNames,
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
      tenantId,
    };
    
    const result = await this.usersService.create(userData);
    const user = result.user;
    
    const { permissions } = await this.rolesService.getUserRolesWithPermissions(user.id);
    if (permissions) {
      await this.userPermissionsService.upsert(user.id, permissions);
    }
    
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

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    let permissions: Record<string, any>;
    const userPermissions = await this.userPermissionsService.findByUserId(user.id);
    
    if (userPermissions?.permissions && Object.keys(userPermissions.permissions).length > 0) {
      permissions = userPermissions.permissions;
    } else {
      const { permissions: rolePermissions } = await this.rolesService.getUserRolesWithPermissions(user.id);
      permissions = rolePermissions || {};
    }

    const { roles } = await this.rolesService.getUserRolesWithPermissions(user.id);
    const roleNames = roles.map(r => r.name);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: roleNames,
      tenantId: user.tenantId,
      permissions,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      defaultBoardId: user.defaultBoardId,
    };
  }
}