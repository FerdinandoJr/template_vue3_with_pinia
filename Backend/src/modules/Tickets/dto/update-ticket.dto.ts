import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../data/ticket.entity';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}