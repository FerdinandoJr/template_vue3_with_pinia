import type { ITicket } from "../domain/entities/Ticket";
import { httpClient } from "@/core/infra/HttpClient";
import { formatCustomerNameFromList } from '@/utils/customer';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

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
}

export interface TicketOptions {
  users: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  priorities: { value: string; label: string }[];
  types: { value: string; label: string }[];
}

export const ticketServices = {
  async list(filter: TicketFilter = {}): Promise<Paginated<ITicket>> {
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
    
    return {
      total: data?.total || items.length,
      filteredTotal: items.length,
      items,
    };
  },

  async getById(id: string): Promise<ITicket | undefined> {
    const response: ApiResponse<ITicket> = await httpClient.get(`/tickets/${id}`);
    return response.data;
  },

  async create(data: Omit<ITicket, 'id' | 'createdAt'>): Promise<ITicket> {
    const response: ApiResponse<ITicket> = await httpClient.post('/tickets', data);
    return response.data;
  },

  async update(id: string, data: Partial<ITicket>): Promise<ITicket> {
    const response: ApiResponse<ITicket> = await httpClient.put(`/tickets/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/tickets/${id}`);
  },

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
    } catch (e) {
      return { users: [], customers: [], priorities: [], types: [] };
    }
  },

  async getStats() {
    try {
      const response = await httpClient.get<any>('/tickets/stats');
      return response?.data || response;
    } catch (e) {
      return null;
    }
  },
};