import type { DashboardPeriod } from "../valueObjects/dashboard-period.enum";

export interface IDashboardStats {
  totalCustomers: number;
  activeTickets: number;
  resolvedToday: number;
  averageResponseTime: string;
  revenueData: number[];
  ticketDistribution: number[];
  period: DashboardPeriod;
  stats?: {
    totalChats?: number;
    openChats?: number;
    openTickets?: number;
    inProgressTickets?: number;
    resolvedTickets?: number;
    chatsVariation?: number;
  };
  recentTickets?: any[];
}