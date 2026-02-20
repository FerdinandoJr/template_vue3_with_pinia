import type { App, InjectionKey } from 'vue';
import { InMemoryDashboardRepository } from "./infra/repositories/InMemoryDashboardRepository";
import { GetDashboardMetrics } from "./application/usecases/GetDashboardMetrics";

export const DashboardDI = {
    GetDashboardMetrics: Symbol('GetDashboardMetrics') as InjectionKey<GetDashboardMetrics>
};

export function setupDashboardDI(app: App) {
    const repository = new InMemoryDashboardRepository();
    
    app.provide(DashboardDI.GetDashboardMetrics, new GetDashboardMetrics(repository));
}