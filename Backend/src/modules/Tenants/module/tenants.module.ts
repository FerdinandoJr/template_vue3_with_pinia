import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from '../controller/tenants.controller';
import { TenantsService } from '../service/tenants.service';
import { Tenant } from '../../../database/postgres/tenant.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}