import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from '../service/tickets.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tickets' })
  async findAll(@Req() req: any, @Query() query: TicketQueryDto) {
    const result = await this.ticketsService.findAll(req.tenantId, query);
    return {
      success: true,
      data: result.items,
      total: result.total,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de tickets' })
  async countByStatus(@Req() req: any) {
    return this.ticketsService.countByStatus(req.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ticket por ID' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo ticket' })
  async create(@Req() req: any, @Body() data: CreateTicketDto) {
    return this.ticketsService.create(req.tenantId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar ticket' })
  async update(@Param('id') id: string, @Body() data: UpdateTicketDto) {
    return this.ticketsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir ticket' })
  async delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }
}