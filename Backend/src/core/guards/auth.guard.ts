import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../../modules/Users/service/users.service';
import { TenantsService } from '../../modules/Tenants/service/tenants.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
    private tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token nao fornecido');
    }

    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const payload = jwt.verify(token, secret) as any;
      
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario nao encontrado');
      }
      
      if (!user.isActive) {
        throw new UnauthorizedException('Usuario desativado. Faca login novamente.');
      }

      const tenant = await this.tenantsService.findById(payload.tenantId);
      if (!tenant || !tenant.isActive) {
        throw new UnauthorizedException('Empresa desativada. Faca login novamente.');
      }

      request['user'] = payload;
      request['userId'] = payload.sub;
      request['tenantId'] = payload.tenantId;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token invalido ou expirado');
    }

    return true;
  }
}