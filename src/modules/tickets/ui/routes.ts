import TicketsList from "./views/TicketsList.vue";

export default [
    {
        path: '/tickets',
        name: 'Tickets',
        component: TicketsList,
        meta: {
            title: 'Tickets',
            subtitle: 'Gerencie todos os tickets de atendimento'
        }
    }
]