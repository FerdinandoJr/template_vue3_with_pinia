import type { TicketStatus } from "../valueObjects/ticket-status.enum";
import type { TicketPriority } from "../valueObjects/ticket-priority.enum";

export interface ITicket {
  id: number;
  title: string;
  customer: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
}