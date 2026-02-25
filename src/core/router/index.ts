import { createWebHistory, createRouter } from "vue-router"
import AppLayout from "@/layouts/AppLayout.vue"
import { customerRouter } from "@/modules/customer/ui/router/routes"
import ticketsRoutes from "@/modules/tickets/ui/router/routes"
import atendimentosRoutes from "@/modules/service/ui/router/routes"
import kanbanRoutes from "@/modules/kanban/ui/router/routes"
import dashboardRoutes from "@/modules/dashboard/ui/router/routes"
import chatsRoutes from "@/modules/chats/ui/router/routes"
import agendaRoutes from "@/modules/calendar/ui/router/routes"
import kbRoutes from '@/modules/kb/ui/router/routes';
import reportsRoutes from "@/modules/reports/ui/router/routes"
import settingsRoutes from "@/modules/settings/ui/router/routes"

const routes = [
  {
    path: "/",
    component: AppLayout,
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

export default router