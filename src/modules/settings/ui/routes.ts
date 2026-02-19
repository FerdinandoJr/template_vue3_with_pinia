import SettingsView from "./views/SettingsView.vue";

export default [
  {
    path: "/configuracoes",
    name: "Configuracoes",
    component: SettingsView,
    meta: {
      title: "Configurações do Sistema",
      subtitle: "Ajuste as preferências do DataCRM",
    },
  },
];
