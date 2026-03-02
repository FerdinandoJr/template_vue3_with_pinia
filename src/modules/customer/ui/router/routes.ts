import CustomerPage from "../views/CustomerPage.vue";
import CustomerDetailsPage from "../views/CustomerDetailsPage.vue";

export const customerRouter = [
    {
        path: '/clientes',
        name: 'Clientes',
        component: CustomerPage,
        meta: {
            title: 'Meus Clientes',
            subtitle: 'Gerencie sua base de contatos'
        }
    },
    {
        path: '/clientes/:id',
        name: 'CustomerDetails',
        component: CustomerDetailsPage,
        meta: {
            title: 'Perfil do Cliente',
            subtitle: 'Visão 360º da Empresa'
        }
    }
]