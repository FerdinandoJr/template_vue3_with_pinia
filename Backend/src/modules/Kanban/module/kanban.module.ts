import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanController } from '../controller/kanban.controller';
import { KanbanService } from '../service/kanban.service';
import { KanbanColumn, KanbanCard } from '../data/kanban.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanColumn, KanbanCard])],
  controllers: [KanbanController],
  providers: [KanbanService],
  exports: [KanbanService],
})
export class KanbanModule {}