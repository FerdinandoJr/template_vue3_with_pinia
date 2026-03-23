import type { ITicket } from "../domain/entities/Ticket";
import { TicketStatus } from "../domain/valueObjects/ticket-status.enum";
import { TicketPriority } from "../domain/valueObjects/ticket-priority.enum";

export interface TicketFilter {
  query?: string;
  status?: TicketStatus | 'all';
  customers?: string[];
  dateRange?: [Date, Date] | null;
  assignees?: string[];
  ownerOnly?: boolean;
  ownerId?: string;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

let mock: ITicket[] = [
  {
    id: 1,
    title: 'Problema com login',
    customer: 'João Silva',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    createdAt: new Date('2026-03-10'),
    description: 'Usuário relata que a senha não é reconhecida após a última atualização do sistema.',
    assigneeId: '1',
    assigneeName: 'Admin (Você)'
  },
  {
    id: 2,
    title: 'Erro ao processar pagamento',
    customer: 'Maria Santos',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.URGENT,
    createdAt: new Date('2026-03-12'),
    description: 'O cliente tenta pagar por PIX e o QRCode não é gerado na tela final.',
    assigneeId: '2',
    assigneeName: 'João Atendimento'
  },
  {
    id: 3,
    title: 'Dúvida sobre funcionalidade',
    customer: 'Pedro Costa',
    status: TicketStatus.OPEN,
    priority: TicketPriority.LOW,
    createdAt: new Date('2026-03-15'),
    description: 'Como faço para exportar os relatórios em formato Excel?'
  }
];

export const ticketServices = {
  async list(filter: TicketFilter): Promise<Paginated<ITicket>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mock];

        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter(t => t.status === filter.status);
        }

        if (filter.query) {
          const q = filter.query.toLowerCase();
          filtered = filtered.filter(t =>
            t.id.toString().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
          );
        }

        if (filter.customers && filter.customers.length > 0) {
          filtered = filtered.filter(t => filter.customers!.includes(t.customer));
        }

        if (filter.ownerOnly && filter.ownerId) {
          filtered = filtered.filter(t => t.assigneeId === filter.ownerId);
        } else if (filter.assignees && filter.assignees.length > 0) {
          filtered = filtered.filter(t => t.assigneeId && filter.assignees!.includes(t.assigneeId));
        }

        if (filter.dateRange && filter.dateRange.length === 2) {
          const start = new Date(filter.dateRange[0]);
          start.setHours(0, 0, 0, 0);
          const end = new Date(filter.dateRange[1]);
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter(t => t.createdAt >= start && t.createdAt <= end);
        }

        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        const page = filter.page || 1;
        const limit = filter.limit || 10;
        const startIdx = (page - 1) * limit;
        const paginatedItems = filtered.slice(startIdx, startIdx + limit);

        resolve({
          total: mock.length,
          filteredTotal: filtered.length,
          items: paginatedItems
        });
      }, 300);
    });
  },

  async create(data: Omit<ITicket, 'id' | 'createdAt'>): Promise<ITicket> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTicket: ITicket = {
          ...data,
          id: mock.length > 0 ? Math.max(...mock.map(t => t.id)) + 1 : 1,
          createdAt: new Date()
        };
        mock.unshift(newTicket);
        resolve(newTicket);
      }, 300);
    });
  },

  async update(id: number, data: Partial<ITicket>): Promise<ITicket> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mock.findIndex(t => t.id === id);
        if (index !== -1) {
          mock[index] = { ...mock[index], ...data } as ITicket;
          resolve(mock[index] as ITicket);
        } else {
          reject(new Error('Ticket não encontrado'));
        }
      }, 300);
    });
  },

  async delete(id: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mock = mock.filter(t => t.id !== id);
        resolve();
      }, 300);
    });
  }
};