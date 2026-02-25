import TicketsPage from "../views/TicketsPage.vue";

export default [
  {
    path: '/tickets',
    name: 'Tickets',
    component: TicketsPage,
    meta: {
      title: 'Tickets',
      subtitle: 'Gerencie todos os tickets de atendimento'
    }
  }
]