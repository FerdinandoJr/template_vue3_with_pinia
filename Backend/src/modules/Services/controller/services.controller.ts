import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from '../service/services.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

@ApiTags('Services')
@Controller('services')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar serviços' })
  async findAll(@Req() req: any) {
    return this.servicesService.findAll(req.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de serviços' })
  async countByStatus(@Req() req: any) {
    return this.servicesService.countByStatus(req.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  async findOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico do serviço' })
  async getHistory(@Param('id') id: string) {
    return this.servicesService.getHistory(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo serviço' })
  async create(@Req() req: any, @Body() data: CreateServiceDto) {
    return this.servicesService.create(req.tenantId, data);
  }

  @Post(':id/history')
  @ApiOperation({ summary: 'Adicionar ao histórico' })
  async addHistory(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.addHistory(id, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  async update(@Param('id') id: string, @Body() data: UpdateServiceDto) {
    return this.servicesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir serviço' })
  async delete(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}