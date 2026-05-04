import { IsOptional, IsUUID, IsDateString, IsInt, Min, IsString, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TicketQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedTo?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  ownerOnly?: boolean;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ type: [String] })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsOptional()
  assignees?: string[];

  @ApiPropertyOptional({ type: [String] })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsArray()
  @IsOptional()
  customers?: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  dateRange?: [string, string];

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}