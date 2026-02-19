import type { Ticket } from "../entities/Ticket";

export interface ITicketRepository {
    getAll(): Promise<Ticket[]>;
}