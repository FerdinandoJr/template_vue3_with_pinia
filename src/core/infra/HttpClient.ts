import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { ElMessage } from 'element-plus';

export interface HttpClient {
    get<T>(url: string, headers?: Record<string, string>): Promise<T>;
    post<T>(url: string, body: any, headers?: Record<string, string>): Promise<T>;
    put<T>(url: string, body: any, headers?: Record<string, string>): Promise<T>;
    delete<T>(url: string, headers?: Record<string, string>): Promise<T>;
}

export class FetchHttpClient implements HttpClient {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            if (response.status === 401) {
                const authStore = useAuthStore();
                authStore.logout();
                window.location.href = '/login';
                ElMessage.error('Sua sessão expirou. Por favor, faça login novamente.');
                throw new Error('Unauthorized');
            }

            let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
            }

            ElMessage.error(errorMessage);
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    }

    private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const token = localStorage.getItem('token');

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });
        return this.handleResponse<T>(response);
    }

    async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, { method: 'GET', headers });
    }

    async post<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, { method: 'POST', body: JSON.stringify(body), headers });
    }

    async put<T>(url: string, body: any, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, { method: 'PUT', body: JSON.stringify(body), headers });
    }

    async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(url, { method: 'DELETE', headers });
    }
}

export const httpClient = new FetchHttpClient();