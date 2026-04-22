import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_TENANT_KEY = 'isTenant';
export const SkipTenant = () => SetMetadata(IS_TENANT_KEY, true);