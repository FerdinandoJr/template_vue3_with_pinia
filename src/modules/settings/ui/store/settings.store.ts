import { defineStore } from "pinia";
import type { IUserProfile, IWhatsAppConfig } from "../../domain/entities/settings";
import { SettingsTab } from "../../domain/valueObjects/settings-enums";
import { settingsServices } from "../../data/settings.services";

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    activeTab: SettingsTab.PROFILE,
    profile: null as IUserProfile | null,
    whatsapp: null as IWhatsAppConfig | null,
    loading: false
  }),
  actions: {
    setTab(tab: SettingsTab) {
      this.activeTab = tab;
    },
    async fetchSettingsData() {
      this.loading = true;
      try {
        const [profileData, waData] = await Promise.all([
          settingsServices.getUserProfile(),
          settingsServices.getWhatsAppConfig()
        ]);
        this.profile = profileData;
        this.whatsapp = waData;
      } finally {
        this.loading = false;
      }
    }
  }
});