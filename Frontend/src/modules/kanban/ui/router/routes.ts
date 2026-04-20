import KanbanPage from "../views/KanbanPage.vue";

export default [
  {
    path: '/kanban',
    name: 'Kanban',
    component: KanbanPage,
    meta: {
      title: 'Kanban',
      subtitle: 'Acompanhamento do ciclo de vida dos tickets'
    }
  }
];