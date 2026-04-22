import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatsService } from '../service/chats.service';
import { AuthGuard } from '../../../core/guards/auth.guard';

@ApiTags('Chats')
@Controller('chats')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar chats' })
  async findAll(@Req() req: any) {
    return this.chatsService.findAllChats(req.tenantId);
  }

  @Get('queue-count')
  @ApiOperation({ summary: 'Contagem da fila de espera' })
  async getQueueCount(@Req() req: any) {
    return this.chatsService.getQueueCount(req.tenantId);
  }

  @Get('queue')
  @ApiOperation({ summary: 'Listar fila de espera' })
  async getQueue(@Req() req: any) {
    return this.chatsService.getQueue(req.tenantId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Listar mensagens do chat' })
  async findMessages(@Param('id') id: string) {
    return this.chatsService.findChatMessages(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo chat' })
  async create(@Req() req: any, @Query('customerId') customerId?: string) {
    return this.chatsService.createChat(req.tenantId, customerId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Enviar mensagem' })
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { senderId: string; senderType: string; message: string },
  ) {
    return this.chatsService.sendMessage(id, body.senderId, body.senderType, body.message);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Fechar chat' })
  async close(@Param('id') id: string) {
    return this.chatsService.closeChat(id);
  }
}