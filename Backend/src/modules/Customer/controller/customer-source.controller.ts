import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CustomerSourceService } from '../service/customer-source.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { TenantGuard } from '../../../core/guards/tenant.guard';

@Controller('customer-sources')
@UseGuards(AuthGuard, TenantGuard)
export class CustomerSourceController {
  constructor(private readonly customerSourceService: CustomerSourceService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.customerSourceService.findAll(req.tenantId);
  }

  @Post()
  async create(@Req() req: any, @Body('name') name: string) {
    return this.customerSourceService.create(req.tenantId, name);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    return this.customerSourceService.update(id, name);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.customerSourceService.delete(id);
  }
}