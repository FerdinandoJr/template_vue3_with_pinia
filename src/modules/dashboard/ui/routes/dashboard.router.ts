import Dashboard from "../pages/Dashboard.vue";

const dashboardRoutes = [
    {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
            title: 'Dashboard',
            subtitle: 'Bem-vindo à Central de Atendimento'
        }
    },
]

export default dashboardRoutes