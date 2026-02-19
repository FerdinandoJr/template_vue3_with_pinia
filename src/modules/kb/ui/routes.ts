import KnowledgeBaseView from "./views/KnowledgeBaseView.vue";

export default [
    {
        path: '/kb',
        name: 'KnowledgeBase',
        component: KnowledgeBaseView,
        meta: { 
            title: 'Base de Conhecimento', 
            subtitle: 'Central de ajuda e documentação' 
        }
    }
]