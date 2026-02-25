import type { ITicket } from "../domain/entities/ticket";
import { TicketStatus } from "../domain/valueObjects/ticket-status.enum";
import { TicketPriority } from "../domain/valueObjects/ticket-priority.enum";

export interface TicketFilter {
  status?: TicketStatus | 'all';
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

const mock: ITicket[] = [
  { id: 1, title: 'Problema com login', customer: 'João Silva', status: TicketStatus.OPEN, priority: TicketPriority.HIGH, createdAt: new Date('2026-02-17') },
  { id: 2, title: 'Erro ao processar pagamento', customer: 'Maria Santos', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.URGENT, createdAt: new Date('2026-02-17') },
  { id: 3, title: 'Dúvida sobre funcionalidade', customer: 'Pedro Costa', status: TicketStatus.OPEN, priority: TicketPriority.LOW, createdAt: new Date('2026-02-16') },
  { id: 4, title: 'Sistema lento', customer: 'Ana Oliveira', status: TicketStatus.RESOLVED, priority: TicketPriority.MEDIUM, createdAt: new Date('2026-02-15') },
  { id: 5, title: 'Integração não funciona', customer: 'Carlos Mendes', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.HIGH, createdAt: new Date('2026-02-16') },
  { id: 6, title: 'Relatório com erro', customer: 'Julia Ferreira', status: TicketStatus.RESOLVED, priority: TicketPriority.MEDIUM, createdAt: new Date('2026-02-14') },
];

export const ticketServices = {
  async list(filter: TicketFilter): Promise<Paginated<ITicket>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mock];
        
        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter(t => t.status === filter.status);
        }

        resolve({
          total: mock.length,
          filteredTotal: filtered.length,
          items: filtered
        });
      }, 300);
    });
  }
};