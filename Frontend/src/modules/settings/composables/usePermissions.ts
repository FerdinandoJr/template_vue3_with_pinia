import { computed } from 'vue';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

export const usePermissions = () => {
    const authStore = useAuthStore();

    const canAccessModule = (moduleId: string) => {
        return authStore.hasModulePermission(moduleId, 'active');
    };

    const canAccessFeature = (moduleId: string, featureId: string) => {
        return authStore.hasModulePermission(moduleId, 'feature', featureId);
    };

    const availableModules = computed(() => {
        const modules = [
            { id: 'customer', path: '/clientes', icon: 'User', name: 'Clientes' },
            { id: 'atendimentos', path: '/atendimentos', icon: 'Tickets', name: 'Atendimentos' },
            { id: 'chats', path: '/chats', icon: 'ChatDotRound', name: 'Chats' },
            { id: 'kanban', path: '/kanban', icon: 'DataBoard', name: 'Kanban' },
            { id: 'calendar', path: '/agenda', icon: 'Calendar', name: 'Agenda' },
            { id: 'relatorios', path: '/relatorios', icon: 'DataLine', name: 'Relatórios' },
            { id: 'kb', path: '/faq', icon: 'Collection', name: 'FAQ' },
        ];
        
        return modules.filter(m => canAccessModule(m.id));
    });

    return {
        canAccessModule,
        canAccessFeature,
        availableModules,
    };
};