import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKanbanColumnDto {
  @ApiProperty({ example: 'A Fazer' })
  @IsString()
  title: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: '#FF0000', required: false })
  @IsOptional()
  @IsString()
  color?: string;
}

export class CreateKanbanCardDto {
  @ApiProperty({ example: 'Tarefa 1' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Descrição da tarefa', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-da-coluna' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ example: 'uuid-do-ticket', required: false })
  @IsOptional()
  @IsUUID()
  ticketId?: string;
}