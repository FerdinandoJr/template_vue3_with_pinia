import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgendaType } from '../data/agenda.entity';

export class CreateAgendaDto {
  @ApiProperty({ example: 'Reunião com cliente' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Discussão do projeto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AgendaType, example: 'meeting' })
  @IsEnum(AgendaType)
  @IsOptional()
  type?: AgendaType;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-15T11:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'uuid-do-cliente', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: 'uuid-do-agente', required: false })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @ApiProperty({ example: '#FF0000', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: '12345-678', required: false })
  @IsOptional()
  @IsString()
  cep?: string;

  @ApiProperty({ example: 'Rua Exemplo, 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'O cliente confirmou o interesse e combinamos a próxima etapa.', required: false })
  @IsOptional()
  @IsString()
  postMeetingNotes?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ example: 'weekly', required: false })
  @IsOptional()
  @IsString()
  recurrenceType?: string;

  @ApiProperty({ example: [1, 3, 5], required: false })
  @IsOptional()
  @IsArray()
  recurrenceDays?: number[];

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isBlocker?: boolean;
}