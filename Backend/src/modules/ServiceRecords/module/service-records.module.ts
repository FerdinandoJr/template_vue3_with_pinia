import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRecordsController } from '../controller/service-records.controller';
import { ServiceRecordsService } from '../service/service-records.service';
import { ServiceRecord } from '../data/service-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRecord])],
  controllers: [ServiceRecordsController],
  providers: [ServiceRecordsService],
  exports: [ServiceRecordsService],
})
export class ServiceRecordsModule {}