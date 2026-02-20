import type { App, InjectionKey } from 'vue';
import { InMemoryTicketRepository } from "./infra/repositories/InMemoryTicketRepository";
import { GetTickets } from "./application/usecases/GetTickets";

export const TicketsDI = {
    GetTickets: Symbol('GetTickets') as InjectionKey<GetTickets>
};

export function setupTicketsDI(app: App) {
    const repository = new InMemoryTicketRepository();
    app.provide(TicketsDI.GetTickets, new GetTickets(repository));
}