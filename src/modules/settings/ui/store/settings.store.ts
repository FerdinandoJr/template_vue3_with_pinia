import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  UserProfile,
  SystemPreferences,
} from "../../domain/entities/UserSettings";
import { getSettingsUseCase, updateSettingsUseCase } from "../../di";

export const useSettingsStore = defineStore("settings", () => {
  const loading = ref(false);
  const activeTab = ref("perfil");

  const profile = ref<UserProfile>({
    name: "",
    email: "",
    role: "",
    avatar: "",
  });
  const preferences = ref<SystemPreferences>({
    darkMode: false,
    notificationsEmail: true,
    notificationsPush: true,
    language: "pt-BR",
    twoFactorAuth: false,
  });

  const loadSettings = async () => {
    loading.value = true;
    try {
      const data = await getSettingsUseCase.execute();
      profile.value = data.profile;
      preferences.value = data.preferences;
    } finally {
      loading.value = false;
    }
  };

  const saveProfile = async () => {
    loading.value = true;
    try {
      await updateSettingsUseCase.updateProfile(profile.value);
      alert("Perfil atualizado com sucesso!");
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const savePreferences = async () => {
    try {
      await updateSettingsUseCase.updatePreferences(preferences.value);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    loading,
    activeTab,
    profile,
    preferences,
    loadSettings,
    saveProfile,
    savePreferences,
  };
});
