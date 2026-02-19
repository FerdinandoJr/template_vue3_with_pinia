import { createWebHistory, createRouter } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
import dashboardRoutes from "@/modules/dashboard/ui/routes";
import ticketsRoutes from "@/modules/tickets/ui/routes";
import chatsRoutes from "@/modules/chats/ui/routes";
import agendaRoutes from "@/modules/agendas/ui/routes";
import clientsRoutes from "@/modules/clients/ui/routes";
import reportsRoutes from "@/modules/reports/ui/routes";
import kbRoutes from "@/modules/kb/ui/routes";
import kanbanRoutes from "@/modules/kanban/ui/routes";
import atendimentosRoutes from "@/modules/atendimentos/ui/routes";
import settingsRoutes from "@/modules/settings/ui/routes";

const routes = [
  {
    path: "/",
    component: AppLayout,
    children: [
      ...dashboardRoutes,
      ...ticketsRoutes,
      ...chatsRoutes,
      ...agendaRoutes,
      ...clientsRoutes,
      ...reportsRoutes,
      ...kbRoutes,
      ...kanbanRoutes,
      ...atendimentosRoutes,
      ...settingsRoutes,
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
