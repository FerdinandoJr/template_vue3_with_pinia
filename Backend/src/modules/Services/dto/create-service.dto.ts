import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceStatus, ServicePriority, ServiceType } from '../data/service.entity';

export class CreateServiceDto {
  @ApiProperty({ example: 'Solicitação de serviço' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Descrição detalhada do serviço' })
  @IsString()
  description: string;

  @ApiProperty({ example: '12345678900', required: false })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiProperty({ example: 'cliente@email.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ enum: ServicePriority })
  @IsEnum(ServicePriority)
  @IsOptional()
  priority?: ServicePriority;

  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  @IsOptional()
  type?: ServiceType;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  customerId?: string;
}