import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from '../service/settings.service';
import { AuthGuard } from '../../../core/guards/auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar configurações' })
  async findAll(@Req() req: any) {
    return this.settingsService.findAll(req.tenantId);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Buscar configuração por chave' })
  async findByKey(@Param('key') key: string, @Req() req: any) {
    return this.settingsService.findByKey(key, req.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Salvar configuração' })
  async set(@Req() req: any, @Body() body: { key: string; value: string }) {
    return this.settingsService.set(body.key, body.value, req.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir configuração' })
  async delete(@Param('id') id: string) {
    return this.settingsService.delete(id);
  }
}