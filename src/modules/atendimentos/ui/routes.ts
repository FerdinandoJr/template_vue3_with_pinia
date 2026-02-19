import ServiceDeskView from "./views/ServiceDeskView.vue";

export default [
    {
        path: '/atendimentos',
        name: 'Atendimentos',
        component: ServiceDeskView,
        meta: { 
            title: 'Atendimentos', 
            subtitle: 'Gestão de registros de atendimento' 
        }
    }
]