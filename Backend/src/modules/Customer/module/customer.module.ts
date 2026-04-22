import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from '../controller/customers.controller';
import { CustomerSourceController } from '../controller/customer-source.controller';
import { CustomersService } from '../service/customer.service';
import { CustomerSourceService } from '../service/customer-source.service';
import { Customer } from '../data/customer.entity';
import { CustomerSource } from '../data/customer-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerSource])],
  controllers: [CustomersController, CustomerSourceController],
  providers: [CustomersService, CustomerSourceService],
  exports: [CustomersService, CustomerSourceService],
})
export class CustomersModule {}