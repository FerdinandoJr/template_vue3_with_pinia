import type { IDashboardStats } from "../domain/entities/dashboard-stats";
import { DashboardPeriod } from "../domain/valueObjects/dashboard-period.enum";

export const dashboardServices = {
  async getSummary(period: DashboardPeriod): Promise<IDashboardStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalCustomers: 1250,
          activeTickets: 42,
          resolvedToday: 18,
          averageResponseTime: "14 min",
          revenueData: [31, 40, 28, 51, 42, 109, 100],
          ticketDistribution: [44, 55, 13],
          period: period
        });
      }, 500);
    });
  }
};