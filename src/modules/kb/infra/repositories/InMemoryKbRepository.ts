import type { Article } from "../../domain/entities/Article";
import type { IKbRepository } from "../../domain/repositories/IKbRepository";

export class InMemoryKbRepository implements IKbRepository {
    private categories = ['FAQ', 'Guias', 'Tutoriais', 'Políticas', 'API'];
    
    private articles: Article[] = [
        { 
            id: 1, 
            title: 'Como redefinir senha?', 
            category: 'FAQ', 
            excerpt: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 
            readingTime: '3 MIN', 
            updatedAt: '12/02/2026' 
        },
        { 
            id: 2, 
            title: 'Configuração de SMTP', 
            category: 'FAQ', 
            excerpt: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 
            readingTime: '3 MIN', 
            updatedAt: '10/02/2026' 
        },
        { 
            id: 3, 
            title: 'Erro 404 no login', 
            category: 'FAQ', 
            excerpt: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', 
            readingTime: '3 MIN', 
            updatedAt: '01/02/2026' 
        },
        { id: 4, title: 'Integração API', category: 'Guias', excerpt: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', readingTime: '5 MIN', updatedAt: '15/01/2026' },
    ];

    async getCategories(): Promise<string[]> {
        return new Promise(resolve => setTimeout(() => resolve([...this.categories]), 200));
    }

    async getArticles(): Promise<Article[]> {
        return new Promise(resolve => setTimeout(() => resolve([...this.articles]), 300));
    }
}