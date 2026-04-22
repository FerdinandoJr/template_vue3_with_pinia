import type { TicketStatus } from "../valueObjects/ticket-status.enum";
import type { TicketPriority } from "../valueObjects/ticket-priority.enum";

export interface ITicket {
  id: string | number;
  title: string;
  customer: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  estimatedHours?: number;
  type?: 'bug' | 'feature' | 'support' | 'internal';
}