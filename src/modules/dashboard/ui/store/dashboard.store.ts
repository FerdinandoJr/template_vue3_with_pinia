import { defineStore } from "pinia";
import type { IDashboardStats } from "../../domain/entities/dashboard-stats";
import { DashboardPeriod } from "../../domain/valueObjects/dashboard-period.enum";
import { dashboardServices } from "../../data/dashboard.services";

interface DashboardState {
  stats: IDashboardStats | null;
  loading: boolean;
  currentPeriod: DashboardPeriod;
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    stats: null,
    loading: false,
    currentPeriod: DashboardPeriod.TODAY // <--- Default 'Hoje' garantido aqui
  }),

  actions: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        const data = await dashboardServices.getSummary(this.currentPeriod);
        this.stats = data;
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        this.loading = false;
      }
    },

    async setPeriod(period: DashboardPeriod) {
      this.currentPeriod = period; // <--- Atualiza o estado para refletir na UI
      await this.fetchDashboardData();
    }
  }
});