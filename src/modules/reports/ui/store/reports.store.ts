import { defineStore } from "pinia";
import type { IReportData } from "../../domain/entities/reports";
import { reportsServices } from "../../data/reports.services";

export const useReportsStore = defineStore('reports', {
  state: () => ({
    data: null as IReportData | null,
    loading: false
  }),
  actions: {
    async fetchReports() {
      this.loading = true;
      try {
        this.data = await reportsServices.getDashboardData();
      } finally {
        this.loading = false;
      }
    }
  }
});