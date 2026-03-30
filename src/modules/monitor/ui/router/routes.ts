export default [
    {
        path: '/monitor',
        name: 'Monitor',
        component: () => import('../views/MonitorPage.vue'),
        meta: {
            title: 'Monitor de Atendimentos',
            requiresAuth: true
        }
    }
];