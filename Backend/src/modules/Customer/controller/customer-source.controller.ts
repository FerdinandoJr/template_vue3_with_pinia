import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerSourceService } from '../service/customer-source.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { TenantGuard } from '../../../core/guards/tenant.guard';
import { CreateCustomerSourceDto } from '../dto/create-customer-source.dto';
import { UpdateCustomerSourceDto } from '../dto/update-customer-source.dto';

@ApiTags('Customer Sources')
@Controller('customer-sources')
@UseGuards(AuthGuard, TenantGuard)
@ApiBearerAuth()
export class CustomerSourceController {
  constructor(private readonly customerSourceService: CustomerSourceService) {}

  @Get()
  @ApiOperation({ summary: 'Listar origens de clientes' })
  async findAll(@Req() req: any) {
    return this.customerSourceService.findAll(req.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar origem de cliente' })
  async create(@Req() req: any, @Body() data: CreateCustomerSourceDto) {
    return this.customerSourceService.create(req.tenantId, data.name);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar origem de cliente' })
  async update(@Param('id') id: string, @Req() req: any, @Body() data: UpdateCustomerSourceDto) {
    return this.customerSourceService.update(id, req.tenantId, data.name);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir origem de cliente' })
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.customerSourceService.delete(id, req.tenantId);
  }
}