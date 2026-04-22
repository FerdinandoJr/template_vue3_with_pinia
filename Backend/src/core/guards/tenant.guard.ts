import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_TENANT_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSkipped = this.reflector.getAllAndOverride<boolean>(IS_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSkipped) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      tenantId = request.tenantId;
    }

    if (!tenantId) {
      throw new BadRequestException('Tenant ID é obrigatório');
    }

    request['tenantId'] = tenantId;
    return true;
  }
}