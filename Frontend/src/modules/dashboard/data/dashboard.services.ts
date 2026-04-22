import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const dashboardServices = {
  async getStats(): Promise<any> {
    const response = await httpClient.get<ApiResponse<any>>('/monitor/dashboard');
    return response.data;
  },
};