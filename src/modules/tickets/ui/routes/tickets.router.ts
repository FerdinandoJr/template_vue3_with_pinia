import Tickets from "../pages/Tickets.vue"

const ticketsRoutes = [
    {
        path: 'tickets',
        name: 'Tickets',
        component: Tickets,
        meta: {
            title: 'Tickets',
            subtitle: 'Gerencie todos os tickets de atendimento'
        }
    },
]

export default ticketsRoutes
