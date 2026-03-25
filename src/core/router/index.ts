import { createWebHistory, createRouter } from "vue-router"
import { customerRouter } from "@/modules/customer/ui/router/routes"
import ticketsRoutes from "@/modules/tickets/ui/router/routes"
import atendimentosRoutes from "@/modules/service/ui/router/routes"
import kanbanRoutes from "@/modules/kanban/ui/router/routes"
import dashboardRoutes from "@/modules/dashboard/ui/router/routes"
import chatsRoutes from "@/modules/chats/ui/router/routes"
import agendaRoutes from "@/modules/calendar/ui/router/routes"
import kbRoutes from '@/modules/kb/ui/router/routes'
import reportsRoutes from "@/modules/reports/ui/router/routes"
import settingsRoutes from "@/modules/settings/ui/router/routes"
import { useAuthStore } from "@/modules/auth/ui/store/auth.store"

const withRoles = (routes: any[], roles: string[]) => {
  return routes.map(route => ({
    ...route,
    meta: {
      ...route.meta,
      roles
    }
  }));
};

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/modules/auth/ui/views/LoginPage.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: "/",
    component: () => import("@/layouts/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      ...dashboardRoutes,
      ...chatsRoutes,
      ...agendaRoutes,
      ...ticketsRoutes,
      ...atendimentosRoutes,
      ...kanbanRoutes,
      ...kbRoutes,
      ...withRoles(reportsRoutes, ['ADMIN', 'MANAGER']),
      ...withRoles(customerRouter, ['ADMIN', 'MANAGER']),
      ...withRoles(settingsRoutes, ['ADMIN']),
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = !!authStore.token || !!localStorage.getItem('token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  if (to.path === '/login' && isAuthenticated) {
    return next('/');
  }

  if (to.meta.roles && Array.isArray(to.meta.roles)) {
    const userRole = authStore.user?.role;

    if (!userRole || !to.meta.roles.includes(userRole)) {
      return next('/');
    }
  }

  next();
});

export default router