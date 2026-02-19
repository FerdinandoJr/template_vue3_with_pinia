import type { DashboardData } from "../entities/DashboardTypes";

export interface IDashboardRepository {
  getDashboardData(): Promise<DashboardData>;
}
