import type { DirectiveBinding } from 'vue';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

export const permissionDirective = {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const authStore = useAuthStore();

        const allowedRoles = binding.value as string[];
        const userRole = authStore.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            el.style.display = 'none';
        }
    }
}