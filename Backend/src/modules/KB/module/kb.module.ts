import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KbController } from '../controller/kb.controller';
import { KbService } from '../service/kb.service';
import { KbArticle } from '../data/kb.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KbArticle])],
  controllers: [KbController],
  providers: [KbService],
  exports: [KbService],
})
export class KbModule {}