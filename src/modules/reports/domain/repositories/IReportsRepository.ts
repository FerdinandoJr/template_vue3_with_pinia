import type { ReportMetrics } from "../entities/ReportMetrics";

export interface IReportsRepository {
  getMetrics(): Promise<ReportMetrics>;
}
