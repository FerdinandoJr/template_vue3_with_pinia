export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface SystemPreferences {
  darkMode: boolean;
  notificationsEmail: boolean;
  notificationsPush: boolean;
  language: string;
  twoFactorAuth: boolean;
}

export interface UserSettings {
  profile: UserProfile;
  preferences: SystemPreferences;
}
