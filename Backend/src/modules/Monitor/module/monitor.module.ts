import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitorController } from '../controller/monitor.controller';
import { MonitorService } from '../service/monitor.service';
import { Ticket } from '../../Tickets/data/ticket.entity';
import { User } from '../../../database/postgres/user.entity';
import { Chat } from '../../Chats/data/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, User, Chat])],
  controllers: [MonitorController],
  providers: [MonitorService],
  exports: [MonitorService],
})
export class MonitorModule {}