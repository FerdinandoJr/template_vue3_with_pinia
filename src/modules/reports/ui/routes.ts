import ReportsView from "./views/ReportsView.vue";

export default [
  {
    path: "/relatorios",
    name: "Relatorios",
    component: ReportsView,
    meta: {
      title: "Relatórios Gerenciais",
      subtitle: "Acompanhe as métricas de desempenho",
    },
  },
];
