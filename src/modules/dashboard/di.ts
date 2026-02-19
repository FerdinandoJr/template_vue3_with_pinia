import { InMemoryDashboardRepository } from "./infra/repositories/InMemoryDashboardRepository";
import { GetDashboardMetrics } from "./application/usecases/GetDashboardMetrics";

const repository = new InMemoryDashboardRepository();

export const getDashboardMetricsUseCase = new GetDashboardMetrics(repository);