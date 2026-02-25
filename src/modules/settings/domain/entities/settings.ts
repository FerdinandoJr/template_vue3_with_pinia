import type { SettingsTab, WhatsAppStatus } from "../valueObjects/settings-enums";

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
}

export interface IWhatsAppConfig {
  phoneNumber: string;
  status: WhatsAppStatus;
  batteryLevel: number;
  lastSync: string;
}