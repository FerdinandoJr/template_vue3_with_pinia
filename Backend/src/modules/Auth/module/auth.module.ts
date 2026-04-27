import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { UsersModule } from '../../Users/module/users.module';
import { UserPermissionsModule } from '../../Users/module/user-permissions.module';
import { TenantsModule } from '../../Tenants/module/tenants.module';
import { CustomersModule } from '../../Customer/module/customer.module';
import { RolesModule } from '../../Roles/module/roles.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret') || 'default-secret',
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn') || '12h',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    UserPermissionsModule,
    TenantsModule,
    forwardRef(() => CustomersModule),
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}