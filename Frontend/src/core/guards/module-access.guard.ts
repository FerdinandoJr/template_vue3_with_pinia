import { createRouterNavGuards } from '@/core/router';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

export const checkModuleAccess = (moduleId: string) => {
    const authStore = useAuthStore();
    return authStore.hasModulePermission(moduleId, 'active');
};

export const checkFeatureAccess = (moduleId: string, featureId: string) => {
    const authStore = useAuthStore();
    return authStore.hasModulePermission(moduleId, 'feature', featureId);
};

export const setupRouteGuards = (router: any) => {
    router.beforeEach((to: any, from: any, next: any) => {
        const authStore = useAuthStore();
        
        const moduleAccessMap: Record<string, string> = {
            '/clientes': 'customer',
            '/atendimentos': 'atendimentos',
            '/chats': 'chats',
            '/kanban': 'kanban',
            '/agenda': 'calendar',
            '/relatorios': 'relatorios',
            '/faq': 'kb',
        };
        
        const requiredModule = moduleAccessMap[to.path];
        if (requiredModule && !authStore.hasModulePermission(requiredModule, 'active')) {
            next('/dashboard');
            return;
        }
        
        next();
    });
};