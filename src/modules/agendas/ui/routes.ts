import AgendaView from "./views/AgendaView.vue";

export default [
    {
        path: '/agenda',
        name: 'Agenda',
        component: AgendaView,
        meta: { title: 'Agenda', subtitle: 'Visualize seus agendamentos' }
    }
]