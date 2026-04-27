import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

export class HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || '') {
        this.baseUrl = baseUrl;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            if (response.status === 401) {
                const authStore = useAuthStore();
                authStore.logout();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            const errorText = await response.text();
            console.log('[HTTP ERROR]', response.status, errorText);
            let errorMessage = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                } else if (errorJson.response?.message) {
                    errorMessage = errorJson.response.message;
                } else if (errorJson.error) {
                    errorMessage = JSON.stringify(errorJson.error);
                } else if (Array.isArray(errorJson.message)) {
                    errorMessage = errorJson.message.join(', ');
                } else {
                    errorMessage = JSON.stringify(errorJson);
                }
            } catch (e) {}
            throw new Error(errorMessage || response.statusText);
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

        if (!isExternalUrl || url.startsWith(this.baseUrl)) {
            const authStore = useAuthStore();
            if (authStore.token) {
                defaultHeaders['Authorization'] = `Bearer ${authStore.token}`;
            }
            if (authStore.user?.tenantId) {
                defaultHeaders['x-tenant-id'] = authStore.user.tenantId;
            }
        }

        let response: Response;
        try {
            response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            });
        } catch (error: any) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
            }
            throw new Error('Erro de conexão. Tente novamente mais tarde.');
        }

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