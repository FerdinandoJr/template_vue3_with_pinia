import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPermissions } from '../../../database/postgres/user-permissions.entity';
import { UserPermissionsService } from '../service/user-permissions.service';
import { UserPermissionsController } from '../controller/user-permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserPermissions])],
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService],
  exports: [UserPermissionsService],
})
export class UserPermissionsModule {}