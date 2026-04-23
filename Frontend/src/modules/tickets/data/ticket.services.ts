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
}

export const ticketServices = {
  async list(filter: TicketFilter = {}): Promise<Paginated<ITicket>> {
    const params = new URLSearchParams();
    if (filter.status && filter.status !== 'all') params.append('status', filter.status);
    if (filter.query) params.append('q', filter.query);
    if (filter.page) params.append('page', String(filter.page));
    if (filter.pageSize) params.append('limit', String(filter.pageSize));
    
    const endpoint = `/tickets${params.toString() ? '?' + params.toString() : ''}`;
    const response = await httpClient.get<any>(endpoint);
    
    const items = response?.data?.data || response?.data || response || [];
    
    return {
      total: items.length,
      filteredTotal: items.length,
      items,
    };
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
      };
    } catch (e) {
      return { users: [], customers: [] };
    }
  },

  async getById(id: string): Promise<ITicket | undefined> {
    const response = await httpClient.get<any>(`/tickets/${id}`);
    return response?.data || response;
  },

  async create(data: Partial<ITicket>): Promise<ITicket> {
    const response = await httpClient.post<any>('/tickets', data);
    return response?.data || response;
  },

  async update(id: string, data: Partial<ITicket>): Promise<ITicket> {
    const response = await httpClient.put<any>(`/tickets/${id}`, data);
    return response?.data || response;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/tickets/${id}`);
  }
};