import type { ITicket } from "../domain/entities/Ticket";
import { TicketStatus } from "../domain/valueObjects/ticket-status.enum";
import { TicketPriority } from "../domain/valueObjects/ticket-priority.enum";

export interface TicketFilter {
  query?: string;
  status?: TicketStatus | 'all';
  customers?: string[];
  dateRange?: [Date, Date] | null;
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

let mock: ITicket[] = [
  { id: 1, title: 'Problema com login', customer: 'João Silva', status: TicketStatus.OPEN, priority: TicketPriority.HIGH, createdAt: new Date('2026-02-17'), description: 'Usuário relata que a senha não é reconhecida após a última atualização do sistema.' },
  { id: 2, title: 'Erro ao processar pagamento', customer: 'Maria Santos', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.URGENT, createdAt: new Date('2026-02-17'), description: 'O cliente tenta pagar por PIX e o QRCode não é gerado na tela final.' },
  { id: 3, title: 'Dúvida sobre funcionalidade', customer: 'Pedro Costa', status: TicketStatus.OPEN, priority: TicketPriority.LOW, createdAt: new Date('2026-02-16'), description: 'Como faço para exportar os relatórios em formato Excel?' },
  { id: 4, title: 'Sistema lento', customer: 'Ana Oliveira', status: TicketStatus.RESOLVED, priority: TicketPriority.MEDIUM, createdAt: new Date('2026-02-15'), description: 'O carregamento do painel administrativo demora mais de 20 segundos.' },
  { id: 5, title: 'Integração não funciona', customer: 'Carlos Mendes', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.HIGH, createdAt: new Date('2026-02-16'), description: 'Conexão com a API do servidor ERP retornando erro 500 constantemente.' },
  { id: 6, title: 'Relatório com erro', customer: 'Julia Ferreira', status: TicketStatus.RESOLVED, priority: TicketPriority.MEDIUM, createdAt: new Date('2026-02-14'), description: 'O somatório total na aba de vendas do mês atual não bate com as faturas fechadas.' },
];

export const ticketServices = {
  async list(filter: TicketFilter): Promise<Paginated<ITicket>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mock];

        // Filtro por Status
        if (filter.status && filter.status !== 'all') {
          filtered = filtered.filter(t => t.status === filter.status);
        }

        // Busca Inteligente (ID, Título, Descrição)
        if (filter.query) {
          const q = filter.query.toLowerCase();
          filtered = filtered.filter(t =>
            t.id.toString().includes(q) ||
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
          );
        }

        // Filtro Múltiplo por Clientes
        if (filter.customers && filter.customers.length > 0) {
          filtered = filtered.filter(t => filter.customers!.includes(t.customer));
        }

        // Filtro por Período de Data
        if (filter.dateRange && filter.dateRange.length === 2) {
          const start = new Date(filter.dateRange[0]);
          start.setHours(0, 0, 0, 0);

          const end = new Date(filter.dateRange[1]);
          end.setHours(23, 59, 59, 999);

          filtered = filtered.filter(t => t.createdAt >= start && t.createdAt <= end);
        }

        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        resolve({
          total: mock.length,
          filteredTotal: filtered.length,
          items: filtered
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