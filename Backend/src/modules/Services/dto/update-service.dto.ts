import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceStatus } from '../data/service.entity';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({ enum: ServiceStatus })
  @IsEnum(ServiceStatus)
  @IsOptional()
  status?: ServiceStatus;
}