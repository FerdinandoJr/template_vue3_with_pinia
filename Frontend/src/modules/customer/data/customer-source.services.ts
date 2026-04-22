import { httpClient } from "@/core/infra/HttpClient";

export interface CustomerSource {
  id: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const customerSourceServices = {
  async list(): Promise<CustomerSource[]> {
    const response = await httpClient.get<ApiResponse<CustomerSource[]>>('/customer-sources');
    return response.data || [];
  },

  async create(name: string): Promise<CustomerSource> {
    const response = await httpClient.post<ApiResponse<CustomerSource>>('/customer-sources', { name });
    return response.data;
  },

  async update(id: string, name: string): Promise<CustomerSource> {
    const response = await httpClient.put<ApiResponse<CustomerSource>>(`/customer-sources/${id}`, { name });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/customer-sources/${id}`);
  },
};