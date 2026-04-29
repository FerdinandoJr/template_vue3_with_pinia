import type { IServiceItem, IServiceHistory } from "../domain/entities/service.entity";
export type { IServiceItem, IServiceHistory };
import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ServiceFilter {
  customerId?: string;
  status?: string;
}

export const serviceServices = {
  async list(filter?: ServiceFilter): Promise<IServiceItem[]> {
    const params = new URLSearchParams();
    if (filter?.customerId) params.append('customerId', filter.customerId);
    if (filter?.status) params.append('status', filter.status);
    
    const endpoint = `/services${params.toString() ? '?' + params.toString() : ''}`;
    const response = await httpClient.get<ApiResponse<IServiceItem[]>>(endpoint);
    return response.data;
  },

  async getById(id: string): Promise<IServiceItem> {
    const response = await httpClient.get<ApiResponse<IServiceItem>>(`/services/${id}`);
    return response.data;
  },

  async create(data: Partial<IServiceItem>): Promise<IServiceItem> {
    const response = await httpClient.post<ApiResponse<IServiceItem>>('/services', data);
    return response.data;
  },

  async update(id: string, data: Partial<IServiceItem>): Promise<IServiceItem> {
    const response = await httpClient.put<ApiResponse<IServiceItem>>(`/services/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/services/${id}`);
  },

  async getHistory(serviceId: string): Promise<IServiceHistory[]> {
    const response = await httpClient.get<ApiResponse<IServiceHistory[]>>(`/services/${serviceId}/history`);
    return response.data;
  },

  async addHistory(serviceId: string, data: Partial<IServiceHistory>): Promise<IServiceHistory> {
    const response = await httpClient.post<ApiResponse<IServiceHistory>>(`/services/${serviceId}/history`, data);
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await httpClient.get<ApiResponse<any>>('/services/stats');
    return response.data;
  },
};