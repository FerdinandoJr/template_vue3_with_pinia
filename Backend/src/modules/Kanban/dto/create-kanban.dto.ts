import { IsString, IsOptional, IsNumber, IsUUID, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKanbanBoardDto {
  @ApiProperty({ example: 'Meu Quadro' })
  @IsString()
  title: string;
}

export class UpdateKanbanBoardDto {
  @ApiProperty({ example: 'Meu Quadro', required: false })
  @IsOptional()
  @IsString()
  title?: string;
}

export class CreateKanbanColumnDto {
  @ApiProperty({ example: 'A Fazer' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'uuid-do-board', required: false })
  @IsOptional()
  @IsUUID()
  boardId?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: '#FF0000', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  wipLimit?: number;
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

  @ApiProperty({ example: 'uuid-do-board', required: false })
  @IsOptional()
  @IsUUID()
  boardId?: string;

  @ApiProperty({ example: 'uuid-do-ticket', required: false })
  @IsOptional()
  @IsUUID()
  ticketId?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: 'urgent', required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ example: 'feature', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'uuid-do-cliente', required: false })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'], required: false })
  @IsOptional()
  @IsArray()
  assignees?: string[];

  @ApiProperty({ example: 2.5, required: false })
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  tags?: any[];

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  checklist?: any[];
}