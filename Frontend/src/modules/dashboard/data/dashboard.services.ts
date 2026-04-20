import type { IDashboardStats } from "../domain/entities/dashboard-stats";
import { DashboardPeriod } from "../domain/valueObjects/dashboard-period.enum";

export const dashboardServices = {
  async getSummary(period: DashboardPeriod, userId?: string, role?: string): Promise<IDashboardStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (role === 'AGENT') {
          switch (period) {
            case DashboardPeriod.TODAY:
              return resolve({
                totalCustomers: 12, activeTickets: 5, resolvedToday: 3,
                averageResponseTime: "4 min",
                revenueData: [2, 5, 4, 8, 7, 10, 15],
                ticketDistribution: [2, 3, 0], period
              });
            case DashboardPeriod.LAST_7_DAYS:
              return resolve({
                totalCustomers: 85, activeTickets: 12, resolvedToday: 34,
                averageResponseTime: "5 min",
                revenueData: [15, 20, 18, 25, 30, 22, 19],
                ticketDistribution: [12, 15, 5], period
              });
            default:
              return resolve({
                totalCustomers: 450, activeTickets: 25, resolvedToday: 210,
                averageResponseTime: "5.5 min",
                revenueData: [80, 95, 110, 105, 120, 130, 140],
                ticketDistribution: [60, 90, 25], period
              });
          }
        }

        else {
          switch (period) {
            case DashboardPeriod.TODAY:
              return resolve({
                totalCustomers: 150, activeTickets: 42, resolvedToday: 18,
                averageResponseTime: "14 min",
                revenueData: [31, 40, 28, 51, 42, 109, 100],
                ticketDistribution: [44, 55, 13], period
              });
            case DashboardPeriod.LAST_7_DAYS:
              return resolve({
                totalCustomers: 850, activeTickets: 120, resolvedToday: 340,
                averageResponseTime: "12 min",
                revenueData: [150, 200, 180, 250, 300, 220, 190],
                ticketDistribution: [120, 150, 50], period
              });
            default:
              return resolve({
                totalCustomers: 1250, activeTickets: 42, resolvedToday: 18,
                averageResponseTime: "14 min",
                revenueData: [800, 950, 1100, 1050, 1200, 1300, 1400],
                ticketDistribution: [600, 900, 250], period
              });
          }
        }
      }, 500);
    });
  }
};