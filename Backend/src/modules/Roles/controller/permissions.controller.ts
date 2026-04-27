import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from '../service/permissions.service';
import { AuthGuard } from '../../../core/guards/auth.guard';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Obter estrutura completa de permissões' })
  async getFullStructure() {
    return this.permissionsService.getFullPermissionsStructure();
  }

  @Get('modules')
  @ApiOperation({ summary: 'Listar módulos do sistema' })
  async getModules() {
    return this.permissionsService.getModules();
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates de roles' })
  async getTemplates() {
    return this.permissionsService.getTemplates();
  }

  @Post('templates')
  @ApiOperation({ summary: 'Criar template de role' })
  async createTemplate(@Body() data: any) {
    return this.permissionsService.createTemplate(data);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Atualizar template de role' })
  async updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.permissionsService.updateTemplate(id, data);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Excluir template de role' })
  async deleteTemplate(@Param('id') id: string) {
    await this.permissionsService.deleteTemplate(id);
    return { success: true };
  }

  @Post('modules')
  @ApiOperation({ summary: 'Criar módulo' })
  async createModule(@Body() data: any) {
    return this.permissionsService.createModule(data);
  }

  @Put('modules/:id')
  @ApiOperation({ summary: 'Atualizar módulo' })
  async updateModule(@Param('id') id: string, @Body() data: any) {
    return this.permissionsService.updateModule(id, data);
  }
}