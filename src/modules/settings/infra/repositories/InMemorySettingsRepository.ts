import type {
  UserSettings,
  UserProfile,
  SystemPreferences,
} from "../../domain/entities/UserSettings";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";

export class InMemorySettingsRepository implements ISettingsRepository {
  private data: UserSettings = {
    profile: {
      name: "Usuário Administrador",
      email: "admin@datacrm.com.br",
      role: "Administrador Senior",
      avatar:
        "https://ui-avatars.com/api/?name=Usuario+Admin&background=0066FF&color=fff",
    },
    preferences: {
      darkMode: false,
      notificationsEmail: true,
      notificationsPush: true,
      language: "pt-BR",
      twoFactorAuth: false,
    },
  };

  async getSettings(): Promise<UserSettings> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(JSON.parse(JSON.stringify(this.data))), 300),
    );
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    return new Promise((resolve) => {
      this.data.profile = { ...profile };
      setTimeout(resolve, 500);
    });
  }

  async updatePreferences(prefs: SystemPreferences): Promise<void> {
    return new Promise((resolve) => {
      this.data.preferences = { ...prefs };
      setTimeout(resolve, 300);
    });
  }
}
