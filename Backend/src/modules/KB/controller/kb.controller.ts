import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KbService } from '../service/kb.service';
import { AuthGuard } from '../../../core/guards/auth.guard';

@ApiTags('KnowledgeBase')
@Controller('kb')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class KbController {
  constructor(private readonly kbService: KbService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias' })
  async findCategories(@Req() req: any) {
    return this.kbService.findCategories(req.tenantId);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Criar categoria' })
  async createCategory(@Req() req: any, @Body() data: any) {
    return this.kbService.createCategory(req.tenantId, data.name);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.kbService.updateCategory(id, data.name);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Excluir categoria' })
  async deleteCategory(@Param('id') id: string) {
    return this.kbService.deleteCategory(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Pesquisar artigos' })
  async search(@Req() req: any, @Query('q') query: string) {
    return this.kbService.search(req.tenantId, query);
  }

  @Get()
  @ApiOperation({ summary: 'Listar artigos' })
  async findAll(@Req() req: any, @Query('category') category?: string) {
    return this.kbService.findAll(req.tenantId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar artigo por ID' })
  async findOne(@Param('id') id: string) {
    return this.kbService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar artigo' })
  async create(@Req() req: any, @Body() data: any) {
    return this.kbService.create(req.tenantId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar artigo' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.kbService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir artigo' })
  async delete(@Param('id') id: string) {
    return this.kbService.delete(id);
  }
}