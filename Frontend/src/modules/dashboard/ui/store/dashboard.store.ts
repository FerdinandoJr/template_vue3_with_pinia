import { defineStore } from "pinia";
import type { IDashboardStats } from "../../domain/entities/dashboard-stats";
import { DashboardPeriod } from "../../domain/valueObjects/dashboard-period.enum";
import { dashboardServices } from "../../data/dashboard.services";
import { useAuthStore } from "@/modules/auth/ui/store/auth.store";

interface DashboardState {
  stats: IDashboardStats | null;
  loading: boolean;
  currentPeriod: DashboardPeriod;
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    stats: null,
    loading: false,
    currentPeriod: DashboardPeriod.TODAY
  }),
  actions: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        const data = await dashboardServices.getStats();
        this.stats = data;
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        this.stats = null;
      } finally {
        this.loading = false;
      }
    },
    async setPeriod(period: DashboardPeriod) {
      this.currentPeriod = period;
      await this.fetchDashboardData();
    }
  }
});