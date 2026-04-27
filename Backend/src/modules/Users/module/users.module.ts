import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../controller/users.controller';
import { UsersService } from '../service/users.service';
import { User } from '../../../database/postgres/user.entity';
import { RolesModule } from '../../Roles/module/roles.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, RolesModule],
})
export class UsersModule {}