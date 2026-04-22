import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from '../controller/services.controller';
import { ServicesService } from '../service/services.service';
import { Service, ServiceHistory } from '../data/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceHistory])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}