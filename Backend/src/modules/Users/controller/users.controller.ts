import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../service/users.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { TenantGuard } from '../../../core/guards/tenant.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll(@Req() req: any) {
    return this.usersService.findAll(req.tenantId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Buscar usuário atual' })
  @ApiResponse({ status: 200, description: 'Usuário atual' })
  async findMe(@Req() req: any) {
    return this.usersService.findById(req.userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  async updateProfile(@Req() req: any, @Body() data: { name?: string; phone?: string; avatar?: string }) {
    return this.usersService.update(req.userId, data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  async create(@Body() data: any) {
    return this.usersService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir usuário' })
  @ApiResponse({ status: 200, description: 'Usuário excluído' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Atualizar permissões do usuário' })
  @ApiResponse({ status: 200, description: 'Permissões atualizadas' })
  async updatePermissions(@Param('id') id: string, @Body() permissions: Record<string, any>) {
    return this.usersService.updatePermissions(id, permissions);
  }
}