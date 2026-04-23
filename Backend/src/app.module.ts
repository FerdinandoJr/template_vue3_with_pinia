import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/Auth/module/auth.module';
import { AgendaModule } from './modules/Calendar/module/agenda.module';
import { TicketsModule } from './modules/Tickets/module/tickets.module';
import { CustomersModule } from './modules/Customer/module/customer.module';
import { KanbanModule } from './modules/Kanban/module/kanban.module';
import { ChatsModule } from './modules/Chats/module/chats.module';
import { KbModule } from './modules/KB/module/kb.module';
import { ReportsModule } from './modules/Reports/module/reports.module';
import { MonitorModule } from './modules/Monitor/module/monitor.module';
import { SettingsModule } from './modules/Settings/module/settings.module';
import { UsersModule } from './modules/Users/module/users.module';
import { UserPermissionsModule } from './modules/Users/module/user-permissions.module';
import { TenantsModule } from './modules/Tenants/module/tenants.module';
import { ServicesModule } from './modules/Services/module/services.module';
import { CoreAuthModule } from './core/guards/core-auth.module';
import { AuthMiddleware } from './core/middleware/auth.middleware';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret') || 'default-secret',
        signOptions: { expiresIn: configService.get('jwt.expiresIn') || '7d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    AgendaModule,
    TicketsModule,
    CustomersModule,
    KanbanModule,
    ChatsModule,
    KbModule,
    ReportsModule,
    MonitorModule,
    SettingsModule,
    UsersModule,
    UserPermissionsModule,
    TenantsModule,
    ServicesModule,
    CoreAuthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}