import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../service/users.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { TenantGuard } from '../../../core/guards/tenant.guard';
import { Public } from '../../../core/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('public-register')
  @ApiOperation({ summary: 'Criar novo usuário (público)' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  async publicCreate(@Body() data: any) {
    const result = await this.usersService.create(data);
    return { token: result.token };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Buscar usuário atual' })
  @ApiResponse({ status: 200, description: 'Usuário atual' })
  async findMe(@Req() req: any) {
    return this.usersService.findById(req.userId);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar perfil do usuário' })
  @ApiResponse({ status: 200, description: 'Perfil atualizado' })
  async updateProfile(@Req() req: any, @Body() data: { name?: string; phone?: string; avatar?: string }) {
    return this.usersService.update(req.userId, data);
  }

  @Get()
  @UseGuards(AuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll(@Req() req: any) {
    const data = await this.usersService.findAll(req.tenantId);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  async create(@Body() data: any) {
    const result = await this.usersService.create(data);
    return result.user;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Excluir usuário' })
  @ApiResponse({ status: 200, description: 'Usuário excluído' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}