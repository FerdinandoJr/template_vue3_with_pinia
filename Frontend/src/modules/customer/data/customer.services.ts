import type { ICustomer } from "../domain/entities/customer";
import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface CustomerFilter {
  query?: string;
  page?: number;
  limit?: number;
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

export const customerServices = {
  async list(filter: CustomerFilter = {}): Promise<Paginated<ICustomer>> {
    const params = new URLSearchParams();
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.query) params.append('q', filter.query);
    
    const endpoint = `/customers${params.toString() ? '?' + params.toString() : ''}`;
    const response = await httpClient.get<ApiResponse<ICustomer[]>>(endpoint);
    
    return {
      total: response.data.length,
      filteredTotal: response.data.length,
      items: response.data,
    };
  },

  async getById(id: string): Promise<ICustomer | undefined> {
    const response = await httpClient.get<ApiResponse<ICustomer>>(`/customers/${id}`);
    return response.data;
  },

  async create(data: Omit<ICustomer, 'id' | 'lastInteraction' | 'openTickets' | 'csat'>): Promise<ICustomer> {
    const response = await httpClient.post<ApiResponse<ICustomer>>('/customers', data);
    return response.data;
  },

  async update(id: string, data: Partial<ICustomer>): Promise<ICustomer> {
    const response = await httpClient.put<ApiResponse<ICustomer>>(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/customers/${id}`);
  },
};