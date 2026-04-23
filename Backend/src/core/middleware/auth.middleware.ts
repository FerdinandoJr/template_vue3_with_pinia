import { Injectable, NestMiddleware, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../../modules/Users/service/users.service';
import { TenantsService } from '../../modules/Tenants/service/tenants.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const publicPaths = ['/auth/login', '/auth/register', '/api/docs', '/health'];

    if (req.path.startsWith('/user-permissions')) {
      console.log('[AuthMiddleware] user-permissions path detected:', req.method, req.path);
    }

    if (publicPaths.some(p => req.path.startsWith(p))) {
      return next();
    }

    const [type, token] = req.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      return next();
    }

    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const payload = jwt.verify(token, secret) as any;
      
      if (req.path.startsWith('/user-permissions')) {
        console.log('[AuthMiddleware] JWT verified for user:', payload.sub);
      }

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

      (req as any).user = payload;
      (req as any).userId = payload.sub;
      (req as any).tenantId = payload.tenantId;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
    }

    next();
  }
}