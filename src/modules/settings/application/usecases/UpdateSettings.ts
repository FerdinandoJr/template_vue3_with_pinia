import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import type {
  UserProfile,
  SystemPreferences,
} from "../../domain/entities/UserSettings";

export class UpdateSettings {
  constructor(private readonly repository: ISettingsRepository) {}

  async updateProfile(profile: UserProfile): Promise<void> {
    await this.repository.updateProfile(profile);
  }

  async updatePreferences(prefs: SystemPreferences): Promise<void> {
    await this.repository.updatePreferences(prefs);
  }
}
