import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

export class HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || '') {
        this.baseUrl = baseUrl;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            // Se o token for recusado pelo servidor, desloga automaticamente
            if (response.status === 401) {
                const authStore = useAuthStore();
                authStore.logout();
                window.location.href = '/login';
            }
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : {} as T;
    }

    private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
        const isExternalUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
        const url = isExternalUrl ? endpoint : `${this.baseUrl}${endpoint}`;

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // TRAVA DE SEGURANÇA: Só anexa o Token JWT se a requisição for interna da API
        if (!isExternalUrl || url.startsWith(this.baseUrl)) {
            const authStore = useAuthStore();
            if (authStore.token) {
                defaultHeaders['Authorization'] = `Bearer ${authStore.token}`;
            }
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

    public async get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', headers });
    }

    public async post<T>(endpoint: string, body: any, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
    }

    public async put<T>(endpoint: string, body: any, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
    }

    public async delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', headers });
    }
}

export const httpClient = new HttpClient();