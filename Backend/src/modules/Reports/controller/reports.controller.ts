import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from '../service/reports.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { TenantGuard } from '../../../core/guards/tenant.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard, TenantGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Resumo de tickets' })
  async getTicketsSummary(@Query('tenantId') tenantId: string) {
    return this.reportsService.getTicketsSummary(tenantId);
  }

  @Get('agents')
  @ApiOperation({ summary: 'Performance de agentes' })
  async getAgentsPerformance(@Query('tenantId') tenantId: string) {
    return this.reportsService.getAgentsPerformance(tenantId);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Resumo de clientes' })
  async getCustomersSummary(@Query('tenantId') tenantId: string) {
    return this.reportsService.getCustomersSummary(tenantId);
  }
}