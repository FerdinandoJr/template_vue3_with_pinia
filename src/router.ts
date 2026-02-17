import { createWebHistory, createRouter } from 'vue-router'
import BaseLayout from './components/BaseLayout.vue'
import dashboardRoutes from './modules/dashboard/ui/routes/dashboard.router'
import ticketsRoutes from './modules/tickets/ui/routes/tickets.router'

const routes = [
    {
        path: '/',
        component: BaseLayout,
        children: [
            ...dashboardRoutes,
            ...ticketsRoutes,
        ]
    },
    // Catch-all route: redireciona rotas inexistentes para a home
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})