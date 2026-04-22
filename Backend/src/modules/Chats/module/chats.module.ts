import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsController } from '../controller/chats.controller';
import { ChatsService } from '../service/chats.service';
import { Chat, ChatMessage } from '../data/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMessage])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}