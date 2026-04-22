import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from '../service/tenants.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { Public } from '../../../core/decorators/public.decorator';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Criar novo tenant' })
  async create(@Body() data: any) {
    return this.tenantsService.create(data);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos os tenants' })
  @ApiBearerAuth()
  async findAll() {
    return this.tenantsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar tenant por ID' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar tenant' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.update(id, data);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir tenant' })
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.tenantsService.delete(id);
  }
}