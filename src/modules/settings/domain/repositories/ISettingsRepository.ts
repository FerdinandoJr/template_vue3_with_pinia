import type {
  UserSettings,
  UserProfile,
  SystemPreferences,
} from "../entities/UserSettings";

export interface ISettingsRepository {
  getSettings(): Promise<UserSettings>;
  updateProfile(profile: UserProfile): Promise<void>;
  updatePreferences(prefs: SystemPreferences): Promise<void>;
}
