import type { IUserProfile, IWhatsAppConfig } from "../domain/entities/settings";
import { WhatsAppStatus } from "../domain/valueObjects/settings-enums";

const mockProfile: IUserProfile = {
  id: '1',
  name: 'Usuário Administrador',
  email: 'admin@datacrm.com',
  phone: '(11) 99999-9999',
  role: 'Administrador Geral',
  avatar: 'https://i.pravatar.cc/150?u=admin'
};

const mockWhatsApp: IWhatsAppConfig = {
  phoneNumber: '+55 11 98888-7777',
  status: WhatsAppStatus.CONNECTED,
  batteryLevel: 85,
  lastSync: 'Agora mesmo'
};

export const settingsServices = {
  async getUserProfile(): Promise<IUserProfile> {
    return new Promise(resolve => setTimeout(() => resolve(mockProfile), 300));
  },
  async getWhatsAppConfig(): Promise<IWhatsAppConfig> {
    return new Promise(resolve => setTimeout(() => resolve(mockWhatsApp), 300));
  }
};