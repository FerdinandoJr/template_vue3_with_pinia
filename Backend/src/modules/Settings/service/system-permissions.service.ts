import { Injectable } from '@nestjs/common';
import { SettingsService } from '../../Settings/service/settings.service';

@Injectable()
export class SystemPermissionsService {
  private readonly KEY = 'system_permissions';
  
  constructor(private settingsService: SettingsService) {}

  async getDefaultPermissions(): Promise<Record<string, any>> {
    const setting = await this.settingsService.getByKey(this.KEY);
    if (setting?.value) {
      return JSON.parse(setting.value);
    }
   
    return {
      customer: { active: true, features: { create: true, edit: true, delete: true } },
      atendimentos: { active: true, features: { create_ticket: true, edit_ticket: true, delete_ticket: true } },
      chats: { active: true, features: { take_over: true, transfer_chat: true, finish_chat: true } },
      kanban: { active: true, features: { move_cards: true, edit_cards: true } },
      calendar: { active: true, features: { create_event: true, edit_event: true, delete_event: true } },
      relatorios: { active: true, features: { view_metrics: true } },
      kb: { active: true, features: { create_article: true, edit_article: true, delete_article: true } },
      monitor: { active: true, features: { view_dashboard: true } },
    };
  }

  async saveDefaultPermissions(permissions: Record<string, any>): Promise<void> {
    await this.settingsService.set(this.KEY, JSON.stringify(permissions));
  }
}