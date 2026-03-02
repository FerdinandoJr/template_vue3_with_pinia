import { defineStore } from 'pinia';
import { authServices } from '../../data/auth.services';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        loading: false,
        error: null as string | null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(email: string, password: string) {
            this.loading = true;
            this.error = null;
            try {
                const response = await authServices.login(email, password);
                this.token = response.token;
                this.user = response.user;

                // Persiste o login no navegador
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                return true;
            } catch (err: any) {
                this.error = err.message || 'Erro ao efetuar login';
                return false;
            } finally {
                this.loading = false;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});