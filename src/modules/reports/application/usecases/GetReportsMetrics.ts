import type { IReportsRepository } from "../../domain/repositories/IReportsRepository";
import type { ReportMetrics } from "../../domain/entities/ReportMetrics";

export class GetReportsMetrics {
  constructor(private readonly repository: IReportsRepository) {}

  async execute(): Promise<ReportMetrics> {
    return await this.repository.getMetrics();
  }
}
