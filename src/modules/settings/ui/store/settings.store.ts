import { defineStore } from "pinia";
import { ref, inject } from "vue";
import type { UserProfile, SystemPreferences } from "../../domain/entities/UserSettings";
import { SettingsDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useSettingsStore = defineStore("settings", () => {
  const getSettingsUseCase = inject(SettingsDI.GetSettings)!;
  const updateSettingsUseCase = inject(SettingsDI.UpdateSettings)!;
  const { showToast } = useToast();

  const loading = ref(false);
  const activeTab = ref("perfil");

  const profile = ref<UserProfile>({ name: "", email: "", role: "", avatar: "" });
  const preferences = ref<SystemPreferences>({ darkMode: false, notificationsEmail: true, notificationsPush: true, language: "pt-BR", twoFactorAuth: false });

  const loadSettings = async () => {
    loading.value = true;
    try {
      const data = await getSettingsUseCase.execute();
      profile.value = data.profile;
      preferences.value = data.preferences;
    } catch (e) {
      showToast("Não foi possível carregar as configurações.", "error");
    } finally {
      loading.value = false;
    }
  };

  const saveProfile = async () => {
    loading.value = true;
    try {
      await updateSettingsUseCase.updateProfile(profile.value);
      showToast("Perfil atualizado com sucesso!", "success");
    } catch (e) {
      showToast("Falha ao atualizar perfil.", "error");
    } finally {
      loading.value = false;
    }
  };

  const savePreferences = async () => {
    try {
      await updateSettingsUseCase.updatePreferences(preferences.value);
      showToast("Preferências de sistema salvas.", "success");
    } catch (e) {
      showToast("Falha ao salvar preferências.", "error");
    }
  };

  return {
    loading, activeTab, profile, preferences,
    loadSettings, saveProfile, savePreferences,
  };
});