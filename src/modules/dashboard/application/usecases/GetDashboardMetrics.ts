import type { DashboardData } from "../../domain/entities/DashboardTypes";
import type { IDashboardRepository } from "../../domain/repositories/IDashboardRepository";

export class GetDashboardMetrics {
    constructor(private readonly repository: IDashboardRepository) {}

    async execute(): Promise<DashboardData> {
        return await this.repository.getDashboardData();
    }
}