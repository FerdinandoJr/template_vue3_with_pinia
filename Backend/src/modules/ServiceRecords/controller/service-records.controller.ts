import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { ServiceRecordsService } from '../service/service-records.service';
import { CreateServiceRecordDto, UpdateServiceRecordDto, ServiceRecordQueryDto } from '../dto/service-record.dto';

@Controller('service-records')
@UseGuards(AuthGuard)
export class ServiceRecordsController {
  constructor(private readonly serviceRecordsService: ServiceRecordsService) {}

  @Get()
  async findAll(@Req() req: any, @Query() query: ServiceRecordQueryDto) {
    return this.serviceRecordsService.findAll(query, req.tenantId);
  }

  @Get('count')
  async getCount(@Req() req: any) {
    return this.serviceRecordsService.getCountByStatus(req.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.serviceRecordsService.findOne(id, req.tenantId);
  }

  @Post()
  async create(@Body() createDto: CreateServiceRecordDto, @Req() req: any) {
    return this.serviceRecordsService.create(createDto, req.tenantId, req.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceRecordDto,
    @Req() req: any,
  ) {
    return this.serviceRecordsService.update(id, updateDto, req.tenantId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.serviceRecordsService.delete(id, req.tenantId);
  }
}