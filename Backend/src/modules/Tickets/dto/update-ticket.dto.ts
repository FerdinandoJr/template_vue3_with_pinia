import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority, TicketType, TicketStatus } from '../data/ticket.entity';

export class UpdateTicketDto {
  @ApiProperty({ example: 'Problema com login', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Não consigo acessar o sistema', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TicketPriority, required: false })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({ enum: TicketType, required: false })
  @IsEnum(TicketType)
  @IsOptional()
  type?: TicketType;

  @ApiProperty({ enum: TicketStatus, required: false })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  boardId?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  tags?: any[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  checklist?: any[];

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}