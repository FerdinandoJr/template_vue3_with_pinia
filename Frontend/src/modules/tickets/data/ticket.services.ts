import type { ITicket } from "../domain/entities/Ticket";
import { httpClient } from "@/core/infra/HttpClient";

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
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

export const ticketServices = {
  async list(filter: TicketFilter = {}): Promise<Paginated<ITicket>> {
    const params = new URLSearchParams();
    if (filter.status && filter.status !== 'all') params.append('status', filter.status);
    if (filter.query) params.append('q', filter.query);
    
    const endpoint = `/tickets${params.toString() ? '?' + params.toString() : ''}`;
    const response = await httpClient.get<ApiResponse<ITicket[]>>(endpoint);
    
    return {
      total: response.data.length,
      filteredTotal: response.data.length,
      items: response.data,
    };
  },

  async getById(id: string): Promise<ITicket | undefined> {
    const response = await httpClient.get<ApiResponse<ITicket>>(`/tickets/${id}`);
    return response.data;
  },

  async create(data: Partial<ITicket>): Promise<ITicket> {
    const response = await httpClient.post<ApiResponse<ITicket>>('/tickets', data);
    return response.data;
  },

  async update(id: string, data: Partial<ITicket>): Promise<ITicket> {
    const response = await httpClient.put<ApiResponse<ITicket>>(`/tickets/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/tickets/${id}`);
  },

  async getStats(): Promise<any> {
    const response = await httpClient.get<ApiResponse<any>>('/tickets/stats');
    return response.data;
  },
};