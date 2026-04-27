import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authServices } from '../../data/auth.services';
import { isTokenValid } from '@/util/jwt';

const STORAGE_KEY = 'datacrm_auth';

function encodeAuth(data: { token: string; user: any }): string {
  const json = JSON.stringify(data);
  return btoa(encodeURIComponent(json));
}

function decodeAuth(encoded: string): { token: string; user: any } | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function loadStoredAuth(): { token: string; user: any } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return decodeAuth(stored);
  } catch {
    return null;
  }
}

async function loadUserFromToken(token: string): Promise<any | null> {
  try {
    const userData = await authServices.me();
    return userData;
  } catch {
    return null;
  }
}

const storedAuth = loadStoredAuth();
const initialToken = storedAuth?.token || null;
const initialUser = storedAuth?.user || null;
const initialLoading = !!initialToken && !initialUser;

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any | null>(initialUser);
  const token = ref<string | null>(initialToken);
  const loading = ref<boolean>(initialLoading);

  const isAuthenticated = computed(() => !!token.value && isTokenValid(token.value));
  const isReady = computed(() => !loading.value && (!!user.value || !token.value));

  const initAuth = async () => {
    if (loading.value) return;

    const stored = loadStoredAuth();
    if (stored && isTokenValid(stored.token)) {
      token.value = stored.token;
      loading.value = true;
      try {
        const userData = await loadUserFromToken(stored.token);
        if (userData) {
          user.value = userData;
        }
      } finally {
        loading.value = false;
      }
    } else if (stored) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (userData: any, userToken: string) => {
    user.value = userData;
    token.value = userToken;
    loading.value = false;
    const authData = encodeAuth({ token: userToken, user: userData });
    localStorage.setItem(STORAGE_KEY, authData);
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    loading.value = false;
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasRole = (rolesToCheck: string[]) => {
    if (!user.value) return false;

    let hasMatch = false;
    if (user.value.roles && Array.isArray(user.value.roles) && user.value.roles.length > 0) {
      hasMatch = user.value.roles.some((userRole: string) =>
        rolesToCheck.some(r => r.toUpperCase() === userRole.toUpperCase() || r.toUpperCase() === userRole.toUpperCase().replace('á', 'a'))
      );
    }

    return hasMatch;
  };

  const hasModulePermission = (moduleId: string, action?: 'active' | 'feature', featureId?: string) => {
    const perms = user.value?.permissions;

    if (!perms || Object.keys(perms).length === 0) {
      return hasRole(['Administrador', 'Gerente', 'Desenvolvedor']);
    }

    const modulePerm = perms[moduleId];

    if (!modulePerm) {
      return false;
    }

    if (modulePerm.active === false) {
      return false;
    }

    if (action === 'active') {
      return modulePerm.active !== false;
    }

    if (action === 'feature' && featureId) {
      if (!modulePerm.features) {
        return false;
      }
      const hasFeature = modulePerm.features[featureId];
      if (hasFeature === undefined) {
        return false;
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

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isReady,
    initAuth,
    login,
    logout,
    hasRole,
    hasModulePermission,
    hasFeature,
    setDefaultBoard,
  };
});