import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { isTokenValid } from '@/util/jwt';
import AppLayout from '@/layouts/AppLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/ui/views/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/modules/dashboard/ui/views/DashboardPage.vue')
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('@/modules/calendar/ui/views/CalendarPage.vue')
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/modules/monitor/ui/views/MonitorPage.vue'),
        meta: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('@/modules/kanban/ui/views/KanbanPage.vue')
      },
      {
        path: 'kb',
        name: 'KnowledgeBase',
        component: () => import('@/modules/kb/ui/views/KbPage.vue')
      },
      {
        path: 'relatorios',
        name: 'Relatorios',
        component: () => import('@/modules/reports/ui/views/ReportsPage.vue'),
        meta: { roles: ['ADMIN', 'MANAGER'] }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('@/modules/customer/ui/views/CustomerPage.vue')
      },
      {
        path: 'customer/:id',
        name: 'CustomerDetails',
        component: () => import('@/modules/customer/ui/views/CustomerDetailsPage.vue')
      },
      {
        path: 'chats',
        name: 'Chats',
        component: () => import('@/modules/chats/ui/views/ChatPage.vue')
      },
      {
        path: 'atendimentos',
        name: 'Atendimentos',
        component: () => import('@/modules/tickets/ui/views/TicketsPage.vue')
      },
      {
        path: 'configuracoes',
        name: 'Configuracoes',
        component: () => import('@/modules/settings/ui/views/SettingsPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !isTokenValid(authStore.token)) {
    authStore.logout();
    return next('/login');
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const userRole = authStore.user?.role;
    if (!userRole || !to.meta.roles.includes(userRole)) {
      return next('/');
    }
  }

  next();
});

export default router;