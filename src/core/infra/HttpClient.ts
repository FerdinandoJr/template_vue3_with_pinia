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

    private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch {
            }
            
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
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