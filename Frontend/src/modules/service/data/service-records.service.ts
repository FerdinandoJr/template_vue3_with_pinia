import { httpClient, type ApiResponse, type PaginatedResponse } from "@/core/infra/HttpClient";

export interface IServiceRecord {
  id?: string;
  serviceNumber?: string;
  subject: string;
  description?: string;
  status: string;
  channel: string;
  customerId?: string;
  customer?: any;
  attendantId?: string;
  attendant?: any;
  ticketId?: string;
  ticket?: any;
  tenantId?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IServiceQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  attendantId?: string;
}

class ServiceRecordsService {
  async list(query: IServiceQuery = {}): Promise<PaginatedResponse<IServiceRecord>> {
    const response = await httpClient.get('/service-records', query);
    return response.data;
  }

  async getById(id: string): Promise<IServiceRecord | undefined> {
    const response = await httpClient.get(`/service-records/${id}`);
    return response.data;
  }

  async create(data: Partial<IServiceRecord>): Promise<IServiceRecord> {
    const response = await httpClient.post('/service-records', data);
    return response.data;
  }

  async update(id: string, data: Partial<IServiceRecord>): Promise<IServiceRecord> {
    const response = await httpClient.put(`/service-records/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/service-records/${id}`);
  }

  async getCount(): Promise<any> {
    const response = await httpClient.get('/service-records/count');
    return response.data;
  }
}

export const serviceRecordsService = new ServiceRecordsService();