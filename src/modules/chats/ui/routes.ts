import ChatsView from "./views/ChatsView.vue";

export default [
    {
        path: '/chats',
        name: 'Chats',
        component: ChatsView,
        meta: { 
            title: 'Chats', 
            subtitle: 'Gerencie suas conversas em tempo real' 
        }
    }
]