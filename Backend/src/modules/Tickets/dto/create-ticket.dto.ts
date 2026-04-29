import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TicketPriority, TicketType, TicketStatus } from '../data/ticket.entity';

export class CreateTagDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'danger' })
  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateTagFromFrontendDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'bg-red-100 text-red-700' })
  @IsString()
  @IsOptional()
  colorClass?: string;
}

export class CreateChecklistItemDto {
  @ApiProperty({ example: 'Verificar logs' })
  @IsString()
  title: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CreateChecklistItemFromFrontendDto {
  @ApiProperty({ example: 'Verificar logs' })
  @IsString()
  text: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  done?: boolean;
}

export class CreateTicketDto {
  @ApiProperty({ example: 'TKT-00001', required: false })
  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @ApiProperty({ example: 'Problema com login' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Não consigo acessar o sistema com meu usuário' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TicketPriority, example: 'medium' })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({ enum: TicketType, example: 'support' })
  @IsEnum(TicketType)
  @IsOptional()
  type?: TicketType;

  @ApiProperty({ example: 'open' })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({ example: 'uuid-do-cliente', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: 'uuid-do-agente' })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'], required: false })
  @IsArray()
  @IsOptional()
  assignees?: string[];

  @ApiProperty({ example: '2024-01-15T10:00:00Z', required: false })
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2024-01-15T11:00:00Z', required: false })
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 2.5, required: false })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiProperty({ example: 'uuid-do-quadro', required: false })
  @IsUUID()
  @IsOptional()
  boardId?: string;

  @ApiProperty({ type: [CreateTagDto], required: false })
  @IsArray()
  @IsOptional()
  tags?: CreateTagDto[];

  @ApiProperty({ type: [CreateTagFromFrontendDto], required: false, description: 'Formato do frontend' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTagFromFrontendDto)
  tagLabels?: CreateTagFromFrontendDto[];

  @ApiProperty({ type: [CreateChecklistItemDto], required: false })
  @IsArray()
  @IsOptional()
  checklist?: CreateChecklistItemDto[];

  @ApiProperty({ type: [CreateChecklistItemFromFrontendDto], required: false, description: 'Formato do frontend' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemFromFrontendDto)
  checklistItems?: CreateChecklistItemFromFrontendDto[];

  @ApiProperty({ type: 'object', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}