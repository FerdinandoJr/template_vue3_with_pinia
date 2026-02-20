import type { App, InjectionKey } from 'vue';
import { InMemoryServiceRepository } from "./infra/repositories/InMemoryServiceRepository";
import { GetServiceHistory } from "./application/usecases/GetServiceHistory";
import { RegisterAttendance } from "./application/usecases/RegisterAttendance";

export const ServiceDI = {
    GetServiceHistory: Symbol('GetServiceHistory') as InjectionKey<GetServiceHistory>,
    RegisterAttendance: Symbol('RegisterAttendance') as InjectionKey<RegisterAttendance>
};

export function setupServiceDI(app: App) {
    const repository = new InMemoryServiceRepository();
    
    app.provide(ServiceDI.GetServiceHistory, new GetServiceHistory(repository));
    app.provide(ServiceDI.RegisterAttendance, new RegisterAttendance(repository));
}