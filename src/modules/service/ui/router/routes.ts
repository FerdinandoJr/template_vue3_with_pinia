import ServicePage from "../views/ServicePage.vue";

export default [
  {
    path: '/atendimentos',
    name: 'Atendimentos',
    component: ServicePage,
    meta: { 
      title: 'Atendimentos', 
      subtitle: 'Gestão de registros de atendimento' 
    }
  }
];