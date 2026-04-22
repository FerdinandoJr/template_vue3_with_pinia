import { httpClient } from '@/core/infra/HttpClient';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const authServices = {
    async login(email: string, password: string): Promise<{ token: string; user: any }> {
        const response = await httpClient.post<ApiResponse<LoginResponse>>('/auth/login', {
            email,
            password,
        });
        
        console.log('API Response:', response);
        
        return {
            token: response.data.access_token,
            user: response.data.user,
        };
    },

    async register(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<any> {
        const response = await httpClient.post<ApiResponse<any>>('/auth/register', data);
        return response.data;
    },

    async logout(): Promise<void> {
        // O logout é feito localmente no store
    },
};