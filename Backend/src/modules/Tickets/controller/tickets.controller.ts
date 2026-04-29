import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TicketsService } from '../service/tickets.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { TicketStatus } from '../data/ticket.entity';
import { TicketStats } from '../service/tickets.service';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tickets com paginação' })
  async findAll(@Req() req: any, @Query() query: TicketQueryDto) {
    const result = await this.ticketsService.findAll(req.tenantId, query);
    return {
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas completas de tickets' })
  async getStats(@Req() req: any) {
    return this.ticketsService.getStats(req.tenantId);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Buscar tickets por status' })
  async findByStatus(@Req() req: any, @Param('status') status: TicketStatus) {
    const result = await this.ticketsService.findAll(req.tenantId, { status, page: 1, limit: 100 });
    return {
      success: true,
      data: result.items,
      total: result.total,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ticket por ID' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo ticket' })
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso' })
  async create(@Req() req: any, @Body() data: CreateTicketDto) {
    return this.ticketsService.create(req.tenantId, req.user.id, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar ticket' })
  async update(@Req() req: any, @Param('id') id: string, @Body() data: UpdateTicketDto) {
    return this.ticketsService.update(id, req.user.id, data);
  }

  @Put(':id/assign/:userId')
  @ApiOperation({ summary: 'Atribuir ticket a usuário' })
  async assign(
    @Req() req: any,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.ticketsService.assignTicket(id, req.user.id, userId);
  }

  @Put(':id/status/:status')
  @ApiOperation({ summary: 'Alterar status do ticket' })
  async changeStatus(
    @Param('id') id: string,
    @Param('status') status: TicketStatus,
  ) {
    return this.ticketsService.changeStatus(id, status);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restaurar ticket excluído' })
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string) {
    return this.ticketsService.restore(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir ticket (soft delete)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }
}