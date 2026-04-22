import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const reportsServices = {
  async getTicketsSummary(): Promise<any> {
    const response = await httpClient.get<ApiResponse<any>>('/reports/tickets');
    return response.data;
  },

  async getAgentsPerformance(): Promise<any[]> {
    const response = await httpClient.get<ApiResponse<any[]>>('/reports/agents');
    return response.data;
  },

  async getCustomersSummary(): Promise<any> {
    const response = await httpClient.get<ApiResponse<any>>('/reports/customers');
    return response.data;
  },
};