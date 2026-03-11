import { createWebHistory, createRouter } from "vue-router"
import AppLayout from "@/layouts/AppLayout.vue"
import LoginPage from "@/modules/auth/ui/views/LoginPage.vue"
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

const routes = [
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      ...dashboardRoutes,
      ...chatsRoutes,
      ...agendaRoutes,
      ...reportsRoutes,
      ...settingsRoutes,
      ...customerRouter,
      ...ticketsRoutes,
      ...atendimentosRoutes,
      ...kanbanRoutes,
      ...kbRoutes,
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
  const isAuthenticated = !!localStorage.getItem('token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  }
  else if (to.path === '/login' && isAuthenticated) {
    next('/');
  }
  else {
    next();
  }
});

export default router