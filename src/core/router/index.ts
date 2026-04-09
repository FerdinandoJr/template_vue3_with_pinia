import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import AppLayout from '@/layouts/AppLayout.vue';

// Função de segurança aprimorada: Valida JWT real, mas perdoa tokens mock de desenvolvimento
const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const parts = token.split('.');

    // Se não tiver 3 partes, não é um JWT real. 
    // Como estamos em ambiente de desenvolvimento com mock, nós liberamos o acesso.
    if (parts.length !== 3) {
      return true;
    }

    // Se for um JWT real, quebra e valida a expiração matemática
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? (payload.exp * 1000 > Date.now()) : true;

  } catch (e) {
    // Fallback de segurança para não quebrar a tela branca
    return true;
  }
};

// Mapeamento completo das rotas que configuramos no sistema
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
        path: 'customer',
        name: 'Customer',
        component: () => import('@/modules/customer/ui/views/CustomerPage.vue')
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
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/modules/monitor/ui/views/MonitorPage.vue'),
        meta: { roles: ['ADMIN', 'MANAGER'] } // Bloqueio direto na rota
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
        meta: { roles: ['ADMIN', 'MANAGER'] } // Bloqueio direto na rota
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

// Guardião Global das Rotas
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const token = authStore.token;
  const isAuthenticated = isTokenValid(token);

  // 1. Bloqueia acesso a rotas privadas se o token for inválido/expirado
  if (to.meta.requiresAuth && !isAuthenticated) {
    authStore.logout();
    return next('/login');
  }

  // 2. Impede o usuário de voltar para o login se já estiver conectado
  if (to.path === '/login' && isAuthenticated) {
    return next('/');
  }

  // 3. Verifica o controle de acesso baseado em papéis (ACL) na rota
  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const userRole = authStore.user?.role;
    if (!userRole || !to.meta.roles.includes(userRole)) {
      return next('/');
    }
  }

  next();
});

export default router;