import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
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