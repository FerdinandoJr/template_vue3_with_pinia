import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../data/settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {}

  async findAll(tenantId: string): Promise<Settings[]> {
    return this.settingsRepository.find({ where: { tenantId } });
  }

  async findByKey(key: string, tenantId: string): Promise<Settings | null> {
    return this.settingsRepository.findOne({ where: { key, tenantId } });
  }

  async set(key: string, value: string, tenantId: string): Promise<Settings> {
    let setting = await this.findByKey(key, tenantId);
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingsRepository.create({ key, value, tenantId });
    }
    return this.settingsRepository.save(setting);
  }

  async delete(id: string): Promise<void> {
    const setting = await this.settingsRepository.findOne({ where: { id } });
    if (!setting) throw new NotFoundException('Configuração não encontrada');
    await this.settingsRepository.remove(setting);
  }
}