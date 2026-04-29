import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanController } from '../controller/kanban.controller';
import { KanbanService } from '../service/kanban.service';
import { KanbanColumn, KanbanCard, KanbanBoard } from '../data/kanban.entity';
import { TicketsModule } from '../../Tickets/module/tickets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KanbanBoard, KanbanColumn, KanbanCard]),
    forwardRef(() => TicketsModule),
  ],
  controllers: [KanbanController],
  providers: [KanbanService],
  exports: [KanbanService],
})
export class KanbanModule {}