import ChatPage from "../views/ChatPage.vue";

export default [
  {
    path: '/chats',
    name: 'Chats',
    component: ChatPage,
    meta: { 
      title: 'Chats WhatsApp', 
      subtitle: 'Gerencie suas conversas do WhatsApp',
      noPadding: true
    }
  }
];