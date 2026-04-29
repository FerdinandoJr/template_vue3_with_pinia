import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../service/customer.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { TenantGuard } from '../../../core/guards/tenant.guard';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(AuthGuard, TenantGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  async findAll(
    @Req() req: any, 
    @Query('q') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const result = await this.customersService.findAll(req.tenantId, query, pageNum, limitNum);
    return {
      success: true,
      data: result.data,
      total: result.total,
      filteredTotal: result.filteredTotal,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.customersService.findById(id, req.tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  async create(@Req() req: any, @Body() data: CreateCustomerDto) {
    return this.customersService.create(req.tenantId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  async update(@Param('id') id: string, @Req() req: any, @Body() data: UpdateCustomerDto) {
    return this.customersService.update(id, req.tenantId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cliente' })
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.customersService.delete(id, req.tenantId);
  }
}