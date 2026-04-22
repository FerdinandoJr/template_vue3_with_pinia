import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MonitorService } from '../service/monitor.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { Public } from '../../../core/decorators/public.decorator';

@ApiTags('Monitor')
@Controller('monitor')
export class MonitorController {
  constructor(private readonly monitorService: MonitorService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do dashboard' })
  async getDashboardData(@Query('tenantId') tenantId: string) {
    return this.monitorService.getDashboardData(tenantId);
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async getSystemHealth() {
    return this.monitorService.getSystemHealth();
  }
}