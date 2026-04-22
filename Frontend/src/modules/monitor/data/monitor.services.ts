import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const monitorServices = {
  async getDashboard(): Promise<any> {
    const response = await httpClient.get<ApiResponse<any>>('/monitor/dashboard');
    return response.data;
  },

  async getHealth(): Promise<any> {
    const response = await httpClient.get<ApiResponse<any>>('/monitor/health');
    return response.data;
  },
};