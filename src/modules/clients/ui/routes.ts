import ClientsView from "./views/ClientsView.vue";

export default [
    {
        path: '/clientes',
        name: 'Clientes',
        component: ClientsView,
        meta: { 
            title: 'Meus Clientes', 
            subtitle: 'Gerencie sua base de contatos' 
        }
    }
]