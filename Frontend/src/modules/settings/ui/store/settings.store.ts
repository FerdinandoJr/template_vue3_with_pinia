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
        const profileData = await settingsServices.getUserProfile();
        this.profile = profileData;
        this.whatsapp = null;
      } finally {
        this.loading = false;
      }
    }
  }
});