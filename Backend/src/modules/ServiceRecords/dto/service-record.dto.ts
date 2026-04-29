import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ServiceRecordChannel, ServiceRecordStatus } from '../data/service-record.entity';

export class CreateServiceRecordDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ServiceRecordStatus)
  @IsOptional()
  status?: ServiceRecordStatus;

  @IsEnum(ServiceRecordChannel)
  @IsOptional()
  channel?: ServiceRecordChannel;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  ticketId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateServiceRecordDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ServiceRecordStatus)
  @IsOptional()
  status?: ServiceRecordStatus;

  @IsEnum(ServiceRecordChannel)
  @IsOptional()
  channel?: ServiceRecordChannel;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  ticketId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ServiceRecordQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  attendantId?: string;
}