import { GetTickets } from "./application/usecases/GetTickets";
import { InMemoryTicketRepository } from "./infra/repositories/InMemoryTicketRepository";

const ticketRepository = new InMemoryTicketRepository();

export const getTicketsUseCase = new GetTickets(ticketRepository);