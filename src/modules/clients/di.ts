import type { App, InjectionKey } from 'vue';
import { InMemoryClientRepository } from "./infra/repositories/InMemoryClientRepository";
import { GetClients } from "./application/usecases/GetClients";

export const ClientsDI = {
    GetClients: Symbol() as InjectionKey<GetClients>
};

export function setupClientsDI(app: App) {
    const repository = new InMemoryClientRepository();
    app.provide(ClientsDI.GetClients, new GetClients(repository));
}