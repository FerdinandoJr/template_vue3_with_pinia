import type { Ticket } from "../../domain/entities/Ticket";
import type { ITicketRepository } from "../../domain/repositories/ITicketRepository";

export class GetTickets {
    constructor(private readonly repository: ITicketRepository) {}

    async execute(): Promise<Ticket[]> {
        return await this.repository.getAll();
    }
}