import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from '../controller/settings.controller';
import { SettingsService } from '../service/settings.service';
import { Settings } from '../data/settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}