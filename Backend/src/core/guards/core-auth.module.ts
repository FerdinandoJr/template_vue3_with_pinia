import { Module, Global, forwardRef } from '@nestjs/common';
import { UsersModule } from '../../modules/Users/module/users.module';
import { TenantsModule } from '../../modules/Tenants/module/tenants.module';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  imports: [UsersModule, TenantsModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class CoreAuthModule {}