import type { ITicket } from "../domain/entities/Ticket";
import { httpClient, type ApiError } from "@/core/infra/HttpClient";
import { formatCustomerNameFromList } from '@/utils/customer';

export interface TicketFilter {
  query?: string;
  status?: string | 'all';
  priority?: string;
  type?: string;
  customers?: (string | number)[];
  dateRange?: [Date, Date];
  ownerOnly?: boolean;
  assignees?: string[];
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
  page?: number;
  limit?: number;
}

export interface TicketOptions {
  users: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  priorities: { value: string; label: string }[];
  types: { value: string; label: string }[];
}

export interface TicketStats {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  avgResolutionTime: number;
  firstResponseRate: number;
}

class TicketService {
  private handleError(error: unknown): never {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as ApiError;
      const message = apiError.response?.data?.message || 'Erro na requisição';
      throw new Error(message);
    }
    throw error;
  }

  async list(filter: TicketFilter = {}): Promise<Paginated<ITicket>> {
    try {
      const params = new URLSearchParams();
      if (filter.status && filter.status !== 'all') params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.type) params.append('type', filter.type);
      if (filter.query) params.append('q', filter.query);
      if (filter.page) params.append('page', String(filter.page));
      if (filter.pageSize) params.append('limit', String(filter.pageSize));
      
      const endpoint = `/tickets${params.toString() ? '?' + params.toString() : ''}`;
      const response = await httpClient.get<any>(endpoint);
      
      const data = response?.data?.data || response?.data || response;
      const items = Array.isArray(data) ? data : (data?.items || []);
      const meta = response?.data?.meta;
      
      return {
        total: meta?.total || data?.total || items.length,
        filteredTotal: meta?.total || items.length,
        items,
        page: meta?.page || filter.page || 1,
        limit: meta?.limit || filter.pageSize || 20,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getById(id: string): Promise<ITicket | null> {
    try {
      const response: any = await httpClient.get(`/tickets/${id}`);
      return response?.data || null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getByTicketNumber(ticketNumber: string): Promise<ITicket | null> {
    try {
      const response: any = await httpClient.get(`/tickets/number/${ticketNumber}`);
      return response?.data || null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: Partial<ITicket>): Promise<ITicket> {
    try {
      const response: any = await httpClient.post('/tickets', data);
      return response?.data || response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, data: Partial<ITicket>): Promise<ITicket> {
    try {
      const response: any = await httpClient.put(`/tickets/${id}`, data);
      return response?.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`/tickets/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async assign(id: string, userId: string): Promise<ITicket> {
    try {
      const response: any = await httpClient.put(`/tickets/${id}/assign/${userId}`, {});
      return response?.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async changeStatus(id: string, status: string): Promise<ITicket> {
    try {
      const response: any = await httpClient.put(`/tickets/${id}/status/${status}`, {});
      return response?.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async restore(id: string): Promise<ITicket> {
    try {
      const response: any = await httpClient.post(`/tickets/${id}/restore`, {});
      return response?.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOptions(): Promise<TicketOptions> {
    try {
      const usersRes = await httpClient.get<any>('/users');
      const customersRes = await httpClient.get<any>('/customers');
      
      const users = usersRes?.data?.data || usersRes?.data || usersRes || [];
      const customers = customersRes?.data?.data || customersRes?.data || customersRes || [];
      
      return {
        users: users.map((u: any) => ({ id: String(u.id), name: u.name || u.email })),
        customers: customers.map((c: any) => ({ id: String(c.id), name: formatCustomerNameFromList(c) })),
        priorities: [
          { value: 'low', label: 'Baixa' },
          { value: 'medium', label: 'Média' },
          { value: 'high', label: 'Alta' },
          { value: 'urgent', label: 'Urgente' },
        ],
        types: [
          { value: 'support', label: 'Suporte' },
          { value: 'bug', label: 'Bug' },
          { value: 'feature', label: 'Melhoria' },
          { value: 'internal', label: 'Interno' },
        ],
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStats(): Promise<TicketStats | null> {
    try {
      const response = await httpClient.get<any>('/tickets/stats');
      return response?.data || null;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getByStatus(status: string, page = 1, limit = 20): Promise<Paginated<ITicket>> {
    try {
      const response = await httpClient.get<any>(`/tickets/by-status/${status}?page=${page}&limit=${limit}`);
      const data = response?.data?.data || response?.data || [];
      return {
        total: response?.data?.total || data.length,
        filteredTotal: response?.data?.total || data.length,
        items: data,
        page,
        limit,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const ticketServices = new TicketService();