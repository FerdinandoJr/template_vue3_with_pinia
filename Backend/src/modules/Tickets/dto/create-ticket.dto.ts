import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../data/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({ example: 'Problema com login' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Não consigo acessar o sistema' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TicketPriority, example: 'medium' })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsUUID()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'uuid-do-agente' })
  @IsUUID()
  @IsOptional()
  assignedTo?: string;
}