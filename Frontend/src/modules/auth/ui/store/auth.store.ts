import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any | null>(null);
    const token = ref<string | null>(null);

    const isAuthenticated = computed(() => !!token.value);

    const login = (userData: any, userToken: string) => {
        user.value = userData;
        token.value = userToken;
    };

    const logout = () => {
        user.value = null;
        token.value = null;

        // Limpeza profunda de resquícios de sessão
        localStorage.removeItem('datacrm_auth_session');
        localStorage.removeItem('token');
        sessionStorage.clear();
    };

    const hasRole = (roles: string[]) => {
        if (!user.value || !user.value.role) return false;
        return roles.includes(user.value.role);
    };

    return { user, token, isAuthenticated, login, logout, hasRole };
}, {
    // Motor de persistência com ofuscação (Base64)
    persist: {
        key: 'datacrm_auth_session',
        storage: {
            getItem: (key: string) => {
                try {
                    const data = localStorage.getItem(key);
                    // Desofusca e converte de volta para JSON
                    return data ? JSON.parse(atob(data)) : null;
                } catch (e) {
                    return null;
                }
            },
            setItem: (key: string, value: any) => {
                // Converte para JSON e ofusca antes de salvar no navegador
                localStorage.setItem(key, btoa(JSON.stringify(value)));
            }
        }
    }
});