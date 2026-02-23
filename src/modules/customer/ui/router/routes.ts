import CustomerPage from "../views/CustomerPage.vue";

export const customerRouter = [
    {
        path: '/clientes',
        name: 'Clientes',
        component: CustomerPage,
        meta: { 
            title: 'Meus Clientes', 
            subtitle: 'Gerencie sua base de contatos' 
        }
    }
]