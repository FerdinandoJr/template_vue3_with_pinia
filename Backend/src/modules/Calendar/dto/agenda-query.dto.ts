import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AgendaType } from '../data/agenda.entity';

export class AgendaQueryDto {
  @ApiPropertyOptional({ enum: AgendaType })
  @IsEnum(AgendaType)
  @IsOptional()
  type?: AgendaType;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;
}