import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from '../service/permissions.service';
import { RolesService } from '../service/roles.service';
import { RoleTemplate, SystemModule } from '../data/permissions.entity';
import { Role, UserRoleAssignment } from '../data/role.entity';
import { RolesController, PermissionsController } from '../controller/roles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRoleAssignment, RoleTemplate, SystemModule]),
  ],
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService, PermissionsService],
})
export class RolesModule {}