import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested, IsBoolean, IsObject, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TicketPriority, TicketType, TicketStatus, TicketSource } from '../data/ticket.entity';

export class CreateTagDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'danger', required: false })
  @IsString()
  @IsOptional()
  color?: string;
}

export class CreateTagFromFrontendDto {
  @ApiProperty({ example: 'Bug' })
  @IsString()
  @MaxLength(50)
  label: string;

  @ApiProperty({ example: 'bg-red-100 text-red-700', required: false })
  @IsString()
  @IsOptional()
  colorClass?: string;
}

export class CreateChecklistItemDto {
  @ApiProperty({ example: 'Verificar logs' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateChecklistItemFromFrontendDto {
  @ApiProperty({ example: 'Verificar logs' })
  @IsString()
  @MaxLength(200)
  text: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  done?: boolean;
}

export class CreateAttachmentDto {
  @ApiProperty({ example: 'documento.pdf' })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsOptional()
  mimeType?: string;

  @ApiProperty({ example: 1024 })
  @IsNumber()
  @IsOptional()
  size?: number;

  @ApiProperty({ example: '/uploads/documento.pdf' })
  @IsString()
  @IsOptional()
  url?: string;
}

export class CreateTicketDto {
  @ApiProperty({ example: 'TKT-00001', required: false })
  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @ApiProperty({ example: 'Problema com login' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Não consigo acessar o sistema com meu usuário', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Notas internas visíveis apenas para a equipe', required: false })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({ enum: TicketPriority, example: 'medium', required: false })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({ enum: TicketType, example: 'support', required: false })
  @IsEnum(TicketType)
  @IsOptional()
  type?: TicketType;

  @ApiProperty({ enum: TicketStatus, example: 'open', required: false })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({ enum: TicketSource, example: 'manual', required: false })
  @IsEnum(TicketSource)
  @IsOptional()
  source?: TicketSource;

  @ApiProperty({ example: 'uuid-do-cliente', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: 'uuid-do-agente', required: false })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'], required: false })
  @IsArray()
  @IsOptional()
  assignees?: string[];

  @ApiProperty({ example: '2024-01-15T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2024-01-15T11:00:00Z', required: false })
  @IsDateString()
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
  @ValidateNested({ each: true })
  @Type(() => CreateTagDto)
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
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistItemDto)
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