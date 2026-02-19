export type TicketStatus = 'open' | 'in-progress' | 'resolved';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
    id: number;
    title: string;
    customer: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: Date;
}