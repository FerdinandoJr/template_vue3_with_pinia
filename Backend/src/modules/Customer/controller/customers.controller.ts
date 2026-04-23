import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from '../service/customer.service';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  async findAll(@Req() req: any, @Query('q') query?: string) {
    const data = await this.customersService.findAll(req.tenantId, query);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  async create(@Req() req: any, @Body() data: CreateCustomerDto) {
    return this.customersService.create(req.tenantId, data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  async update(@Param('id') id: string, @Body() data: UpdateCustomerDto) {
    return this.customersService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cliente' })
  async delete(@Param('id') id: string) {
    return this.customersService.delete(id);
  }
}