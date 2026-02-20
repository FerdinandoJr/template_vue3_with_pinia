import type { App, InjectionKey } from 'vue';
import { InMemoryReportsRepository } from "./infra/repositories/InMemoryReportsRepository";
import { GetReportsMetrics } from "./application/usecases/GetReportsMetrics";

export const ReportsDI = {
    GetReportsMetrics: Symbol('GetReportsMetrics') as InjectionKey<GetReportsMetrics>
};

export function setupReportsDI(app: App) {
    const repository = new InMemoryReportsRepository();
    
    app.provide(ReportsDI.GetReportsMetrics, new GetReportsMetrics(repository));
}