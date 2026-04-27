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
        component: () => import('@/modules/monitor/ui/views/MonitorPage.vue')
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
        component: () => import('@/modules/reports/ui/views/ReportsPage.vue')
      },
{
        path: 'customer',
        name: 'Customer',
        component: () => import('@/modules/customer/ui/views/CustomerPage.vue'),
        meta: { moduleAccess: 'customer' }
      },
      {
        path: 'customer/:id',
        name: 'CustomerDetails',
        component: () => import('@/modules/customer/ui/views/CustomerDetailsPage.vue'),
        meta: { moduleAccess: 'customer' }
      },
      {
        path: 'chats',
        name: 'Chats',
        component: () => import('@/modules/chats/ui/views/ChatPage.vue'),
        meta: { moduleAccess: 'chats' }
      },
      {
        path: 'atendimentos',
        name: 'Atendimentos',
        component: () => import('@/modules/tickets/ui/views/TicketsPage.vue'),
        meta: { moduleAccess: 'atendimentos' }
      },
      {
        path: 'kanban',
        name: 'Kanban',
        component: () => import('@/modules/kanban/ui/views/KanbanPage.vue'),
        meta: { moduleAccess: 'kanban' }
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('@/modules/calendar/ui/views/CalendarPage.vue'),
        meta: { moduleAccess: 'calendar' }
      },
      {
        path: 'relatorios',
        name: 'Relatorios',
        component: () => import('@/modules/reports/ui/views/ReportsPage.vue'),
        meta: { moduleAccess: 'relatorios' }
      },
      {
        path: 'kb',
        name: 'KnowledgeBase',
        component: () => import('@/modules/kb/ui/views/KbPage.vue'),
        meta: { moduleAccess: 'kb' }
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Se não está pronto e tem token, aguardar carregamento
  if (!authStore.isReady && authStore.token) {
    console.log('Auth loading, waiting...');
    await authStore.initAuth();
  }

  // Se ainda tem token mas não carregou, permitir acesso (vai tentar carregar)
  if (to.meta.requiresAuth && !authStore.isReady && authStore.token) {
    console.log('Allowing access while loading auth');
    return next();
  }

  // Debug
  console.log('Router - to:', to.path, 'auth:', !!authStore.token, 'user:', authStore.user?.name, 'ready:', authStore.isReady);

  if (to.meta.requiresAuth && !authStore.token) {
    console.log('Redirect to login - no token');
    return next('/login');
  }

  if (to.path === '/login' && authStore.token) {
    console.log('Redirect to dashboard - already logged in');
    return next('/');
  }

  // Verificar acesso por módulo
  if (to.meta.moduleAccess) {
    const moduleId = to.meta.moduleAccess as string;
    if (!authStore.hasModulePermission(moduleId, 'active')) {
      console.log('Access denied - module:', moduleId);
      return next('/');
    }
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