import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from '../service/roles.service';
import { PermissionsService } from '../service/permissions.service';
import { AuthGuard } from '../../../core/guards/auth.guard';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os cargos' })
  async findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates de roles' })
  async getTemplates() {
    return this.rolesService.getTemplates();
  }

  @Post()
  @ApiOperation({ summary: 'Criar cargo' })
  async createRole(@Body() data: any) {
    return this.rolesService.createRole(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cargo' })
  async updateRole(@Param('id') id: string, @Body() data: any) {
    return this.rolesService.updateRole(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cargo' })
  async deleteRole(@Param('id') id: string) {
    await this.rolesService.deleteRole(id);
    return { success: true };
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reordenar cargos' })
  async reorderRoles(@Body() roleIds: string[]) {
    return this.rolesService.reorderRoles(roleIds);
  }

  @Post(':id/assign/:userId')
  @ApiOperation({ summary: 'Atribuir cargo ao usuário' })
  async assignRole(@Param('id') id: string, @Param('userId') userId: string, @Req() req: any) {
    return this.rolesService.assignRoleToUser(userId, id, req.tenantId);
  }

  @Delete(':id/remove/:userId')
  @ApiOperation({ summary: 'Remover cargo do usuário' })
  async removeRole(@Param('id') id: string, @Param('userId') userId: string) {
    await this.rolesService.removeRoleFromUser(userId, id);
    return { success: true };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar cargos do usuário' })
  async getUserRoles(@Param('userId') userId: string) {
    return this.rolesService.getUserRoles(userId);
  }
}

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
}