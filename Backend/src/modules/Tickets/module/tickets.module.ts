import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from '../controller/tickets.controller';
import { TicketsService } from '../service/tickets.service';
import { Ticket } from '../data/ticket.entity';
import { TicketTag } from '../data/ticket-tag.entity';
import { TicketChecklist } from '../data/ticket-checklist.entity';
import { TicketAttachment } from '../data/ticket-attachment.entity';
import { KanbanModule } from '../../Kanban/module/kanban.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketTag, TicketChecklist, TicketAttachment]),
    forwardRef(() => KanbanModule)
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}