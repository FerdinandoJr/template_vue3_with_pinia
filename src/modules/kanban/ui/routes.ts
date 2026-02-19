import KanbanView from "./views/KanbanView.vue";

export default [
    {
        path: '/kanban',
        name: 'Kanban',
        component: KanbanView,
        meta: { 
            title: 'Kanban', 
            subtitle: 'Gestão visual de tarefas' 
        }
    }
]