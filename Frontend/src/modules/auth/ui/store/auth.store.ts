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
        const userRole = user.value.role.toLowerCase();
        return roles.some(role => userRole === role.toLowerCase());
    };

const hasModulePermission = (moduleId: string, action?: 'active' | 'feature', featureId?: string) => {
        const perms = user.value?.permissions;
        
        // Se não tem permissões salvas, acesso TOTAL (padrão)
        if (!perms || Object.keys(perms).length === 0) {
            return true;
        }
        
        const modulePerm = perms[moduleId];
        
        // Se o módulo não existe nas permissões, acesso TOTAL
        if (!modulePerm) {
            return true;
        }
        
        // Se está desativado o módulo inteiro
        if (modulePerm.active === false) {
            return false;
        }
        
        // Se action é 'active', retorna se o módulo está ativo
        if (action === 'active') {
            return modulePerm.active !== false;
        }
        
        // Se action é 'feature', verifica a feature específica
        if (action === 'feature' && featureId) {
            // Se não tem a feature, mas o módulo está ativo, permite
            if (!modulePerm.features) {
                return true;
            }
            const hasFeature = modulePerm.features[featureId];
            // Se a feature não existe, permite por padrão
            if (hasFeature === undefined) {
                return true;
            }
            return hasFeature === true;
        }
        
        return true;
    };

    const setDefaultBoard = (boardId: string) => {
        if (user.value) {
            user.value.defaultBoardId = boardId;
        }
    };

    const hasFeature = (moduleId: string, featureId: string) => {
        return hasModulePermission(moduleId, 'feature', featureId);
    };

    return { user, token, isAuthenticated, login, logout, hasRole, hasModulePermission, hasFeature, setDefaultBoard };
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