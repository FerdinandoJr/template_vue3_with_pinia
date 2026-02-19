import { InMemoryReportsRepository } from "./infra/repositories/InMemoryReportsRepository";
import { GetReportsMetrics } from "./application/usecases/GetReportsMetrics";

const repository = new InMemoryReportsRepository();

export const getReportsMetricsUseCase = new GetReportsMetrics(repository);
