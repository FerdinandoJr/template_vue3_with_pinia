import type { IKbArticle, IKbCategory } from "../domain/entities/kb";
import { generateUUIDv7 } from "@/util/helpers";

export interface PaginatedKbResult {
  data: IKbArticle[];
  total: number;
  page: number;
  limit: number;
}

let mockCategories: IKbCategory[] = [
  { id: 'c1', name: 'FAQ' },
  { id: 'c2', name: 'Tutorial' },
  { id: 'c3', name: 'Política' },
  { id: 'c4', name: 'Script' }
];

let mockArticles: IKbArticle[] = [
  { id: '1', title: 'Script de Abordagem Inicial (WhatsApp)', excerpt: 'Como iniciar a conversa com um lead frio que acabou de se cadastrar no site.', content: 'Olá [Nome], tudo bem?\n\nVi que você se cadastrou em nosso site e gostaria de saber se você tem alguma dúvida. Estou à disposição!', category: 'Script', authorName: 'Ana Silva', authorAvatar: 'https://i.pravatar.cc/150?u=ana', date: '10 Fev 2026', readTimeMinutes: 2, views: 1240, icon: 'ChatDotRound', status: 'Publicado', visibility: 'Publico' },
  { id: '2', title: 'Política de Reembolso 2026', excerpt: 'Regras atualizadas para solicitação de estorno e cancelamento de contratos.', content: 'O cliente tem até 7 dias úteis para solicitar o reembolso total após a compra, conforme o Art. 49 do CDC.\n\nPara solicitar, o cliente deve enviar um e-mail formalizando o pedido.', category: 'Política', authorName: 'Carlos Mendes', authorAvatar: 'https://i.pravatar.cc/150?u=carlos', date: '15 Jan 2026', readTimeMinutes: 5, views: 890, icon: 'Document', status: 'Publicado', visibility: 'Publico' },
  { id: '3', title: 'Como transferir um Ticket?', excerpt: 'Passo a passo para enviar um atendimento de Nível 1 para o Suporte Técnico.', content: 'No módulo de Tickets, clique no botão Transferir no canto superior direito. Selecione o departamento "Suporte Técnico" e deixe uma nota interna com o resumo do problema antes de confirmar.', category: 'Tutorial', authorName: 'Fernanda Lima', authorAvatar: 'https://i.pravatar.cc/150?u=fernanda', date: '02 Mar 2026', readTimeMinutes: 3, views: 2150, icon: 'Switch', status: 'Publicado', visibility: 'Privado' },
];

export const kbServices = {
  async getArticles(params: { page: number; limit: number; search?: string; category?: string; role?: string }): Promise<PaginatedKbResult> {
    return new Promise(resolve => {
      setTimeout(() => {
        let result = [...mockArticles];

        const allowedRoles = ['ADMIN', 'MANAGER', 'AGENT'];
        if (!params.role || !allowedRoles.includes(params.role)) {
          result = result.filter(a => a.visibility === 'Publico');
        }

        if (params.category && params.category !== 'Todas') {
          result = result.filter(a => a.category === params.category);
        }

        if (params.search && params.search.trim()) {
          const query = params.search.toLowerCase();
          result = result.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.excerpt.toLowerCase().includes(query) ||
            a.content.toLowerCase().includes(query)
          );
        }

        const total = result.length;
        const start = (params.page - 1) * params.limit;
        const paginatedData = result.slice(start, start + params.limit);

        resolve({
          data: paginatedData,
          total,
          page: params.page,
          limit: params.limit
        });
      }, 300);
    });
  },

  async createArticle(data: Omit<IKbArticle, 'id' | 'views' | 'date'>): Promise<IKbArticle> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newArticle: IKbArticle = {
          ...data,
          id: generateUUIDv7(),
          views: 0,
          date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        mockArticles.unshift(newArticle);
        resolve(newArticle);
      }, 400);
    });
  },

  async updateArticle(id: string, data: Partial<IKbArticle>): Promise<IKbArticle> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockArticles.findIndex(a => a.id === id);
        if (index === -1) return reject(new Error("Artigo não encontrado"));
        const updatedArticle = { ...mockArticles[index], ...data } as IKbArticle;
        mockArticles[index] = updatedArticle;
        resolve(updatedArticle);
      }, 400);
    });
  },

  async deleteArticle(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockArticles.findIndex(a => a.id === id);
        if (index === -1) return reject(new Error("Artigo não encontrado"));
        mockArticles.splice(index, 1);
        resolve();
      }, 400);
    });
  },

  async getCategories(): Promise<IKbCategory[]> {
    return new Promise(resolve => setTimeout(() => resolve([...mockCategories]), 200));
  },

  async createCategory(name: string): Promise<IKbCategory> {
    return new Promise(resolve => setTimeout(() => {
      const newCat = { id: generateUUIDv7(), name };
      mockCategories.push(newCat);
      resolve(newCat);
    }, 300));
  },

  async updateCategory(id: string, name: string): Promise<IKbCategory> {
    return new Promise((resolve, reject) => setTimeout(() => {
      const category = mockCategories.find(c => c.id === id);
      if (!category) return reject(new Error("Categoria não encontrada"));
      category.name = name;
      resolve(category);
    }, 300));
  },

  async deleteCategory(id: string): Promise<void> {
    return new Promise((resolve, reject) => setTimeout(() => {
      const index = mockCategories.findIndex(c => c.id === id);
      if (index === -1) return reject(new Error("Categoria não encontrada"));
      mockCategories.splice(index, 1);
      resolve();
    }, 300));
  }
};