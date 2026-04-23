import { Controller, Get, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserPermissionsService } from '../service/user-permissions.service';
import { AuthGuard } from '../../../core/guards/auth.guard';

@ApiTags('User Permissions')
@Controller('user-permissions')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserPermissionsController {
  constructor(private readonly permissionsService: UserPermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as permissões' })
  @ApiResponse({ status: 200, description: 'Lista de permissões' })
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Buscar permissões de um usuário' })
  @ApiResponse({ status: 200, description: 'Permissões do usuário' })
  async findByUser(@Param('userId') userId: string) {
    return this.permissionsService.findByUserId(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Buscar permissões do usuário logado' })
  @ApiResponse({ status: 200, description: 'Minhas permissões' })
  async findMyPermissions(@Req() req: any) {
    return this.permissionsService.findByUserId(req.userId);
  }

  @Put('user/:userId')
  @ApiOperation({ summary: 'Salvar permissões de um usuário' })
  @ApiResponse({ status: 200, description: 'Permissões salvas' })
  async savePermissions(@Param('userId') userId: string, @Body() permissions: Record<string, any>) {
    console.log('===========================================');
    console.log('[UserPermissionsController] PUT called!');
    console.log('[UserPermissionsController] userId:', userId);
    console.log('[UserPermissionsController] permissions:', JSON.stringify(permissions, null, 2));
    console.log('===========================================');
    const result = await this.permissionsService.upsert(userId, permissions);
    console.log('[UserPermissionsController] Result saved:', JSON.stringify(result));
    return result;
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Remover permissões de um usuário' })
  @ApiResponse({ status: 200, description: 'Permissões removidas' })
  async deletePermissions(@Param('userId') userId: string) {
    await this.permissionsService.delete(userId);
    return { success: true };
  }
}