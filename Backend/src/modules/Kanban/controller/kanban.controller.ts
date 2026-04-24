import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KanbanService } from '../service/kanban.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CreateKanbanColumnDto, CreateKanbanCardDto, CreateKanbanBoardDto, UpdateKanbanBoardDto } from '../dto/create-kanban.dto';

@ApiTags('Kanban')
@Controller('kanban')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get('boards')
  @ApiOperation({ summary: 'Listar quadros' })
  async findAllBoards(@Req() req: any) {
    return this.kanbanService.findAllBoards(req.tenantId);
  }

  @Post('boards')
  @ApiOperation({ summary: 'Criar quadro com colunas padrão' })
  async createBoard(@Req() req: any, @Body() data: CreateKanbanBoardDto) {
    return this.kanbanService.createBoard(req.tenantId, data);
  }

  @Put('boards/:id')
  @ApiOperation({ summary: 'Atualizar quadro' })
  async updateBoard(@Param('id') id: string, @Body() data: UpdateKanbanBoardDto) {
    return this.kanbanService.updateBoard(id, data);
  }

  @Delete('boards/:id')
  @ApiOperation({ summary: 'Excluir quadro' })
  async deleteBoard(@Param('id') id: string) {
    return this.kanbanService.deleteBoard(id);
  }

  @Get('columns')
  @ApiOperation({ summary: 'Listar colunas' })
  async findAllColumns(@Req() req: any) {
    return this.kanbanService.findAllColumns(req.tenantId);
  }

  @Get('columns/:boardId')
  @ApiOperation({ summary: 'Listar colunas por quadro' })
  async findColumnsByBoard(@Param('boardId') boardId: string) {
    return this.kanbanService.findColumnsByBoard(boardId);
  }

  @Get('cards')
  @ApiOperation({ summary: 'Listar cards' })
  async findAllCards(@Req() req: any) {
    return this.kanbanService.findAllCards(req.tenantId);
  }

  @Post('columns')
  @ApiOperation({ summary: 'Criar coluna' })
  async createColumn(@Req() req: any, @Body() data: CreateKanbanColumnDto) {
    return this.kanbanService.createColumn(req.tenantId, data);
  }

  @Put('columns/:id')
  @ApiOperation({ summary: 'Atualizar coluna' })
  async updateColumn(@Param('id') id: string, @Body() data: Partial<CreateKanbanColumnDto>) {
    return this.kanbanService.updateColumn(id, data);
  }

  @Delete('columns/:id')
  @ApiOperation({ summary: 'Excluir coluna' })
  async deleteColumn(@Param('id') id: string) {
    return this.kanbanService.deleteColumn(id);
  }

  @Put('columns/reorder/:boardId')
  @ApiOperation({ summary: 'Reordenar colunas' })
  async reorderColumns(@Param('boardId') boardId: string, @Body() columnIds: string[]) {
    return this.kanbanService.reorderColumns(boardId, columnIds);
  }

  @Post('cards')
  @ApiOperation({ summary: 'Criar card' })
  async createCard(@Req() req: any, @Body() data: CreateKanbanCardDto) {
    return this.kanbanService.createCard(req.tenantId, data);
  }

  @Put('cards/:id')
  @ApiOperation({ summary: 'Atualizar card' })
  async updateCard(@Param('id') id: string, @Body() data: Partial<CreateKanbanCardDto>) {
    return this.kanbanService.updateCard(id, data);
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Excluir card' })
  async deleteCard(@Param('id') id: string) {
    return this.kanbanService.deleteCard(id);
  }
}