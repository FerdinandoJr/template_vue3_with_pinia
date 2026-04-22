import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaController } from '../controller/agenda.controller';
import { AgendaService } from '../service/agenda.service';
import { Agenda } from '../data/agenda.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agenda])],
  controllers: [AgendaController],
  providers: [AgendaService],
  exports: [AgendaService],
})
export class AgendaModule {}