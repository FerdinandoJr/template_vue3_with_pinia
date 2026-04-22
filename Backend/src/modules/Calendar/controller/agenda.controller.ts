import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgendaService } from '../service/agenda.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CreateAgendaDto } from '../dto/create-agenda.dto';
import { UpdateAgendaDto } from '../dto/update-agenda.dto';
import { AgendaQueryDto } from '../dto/agenda-query.dto';

@ApiTags('Agenda')
@Controller('agenda')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar eventos' })
  async findAll(@Req() req: any, @Query() query: AgendaQueryDto) {
    const res = await this.agendaService.findAll(req.tenantId, query);
    console.log('[Backend] GET /agenda returned:', res.map(r => ({ id: r.id, assignedTo: r.assignedTo, customerId: r.customerId, color: r.color, cep: r.cep, address: r.address })));
    return res;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar evento por ID' })
  async findOne(@Param('id') id: string) {
    return this.agendaService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo evento' })
  async create(@Req() req: any, @Body() data: CreateAgendaDto) {
    return this.agendaService.create(req.tenantId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar evento' })
  async update(@Param('id') id: string, @Body() data: UpdateAgendaDto) {
    return this.agendaService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir evento' })
  async delete(@Param('id') id: string) {
    return this.agendaService.delete(id);
  }
}