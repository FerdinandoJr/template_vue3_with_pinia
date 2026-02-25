import type { IKbArticle } from "../domain/entities/kb";
import { ArticleCategory } from "../domain/valueObjects/kb-enums";

const mockArticles: IKbArticle[] = [
  {
    id: '1',
    title: 'Script de Abordagem Inicial (WhatsApp)',
    excerpt: 'Como iniciar a conversa com um lead frio que acabou de se cadastrar no site.',
    content: 'Olá [Nome], tudo bem? Vi que você se cadastrou em nosso site...',
    category: ArticleCategory.SCRIPT,
    authorName: 'Ana Silva',
    authorAvatar: 'https://i.pravatar.cc/150?u=ana',
    date: '10 Fev 2026',
    readTimeMinutes: 2,
    views: 1240,
    icon: '💬'
  },
  {
    id: '2',
    title: 'Política de Reembolso 2026',
    excerpt: 'Regras atualizadas para solicitação de estorno e cancelamento de contratos.',
    content: 'O cliente tem até 7 dias úteis para solicitar o reembolso total...',
    category: ArticleCategory.POLICY,
    authorName: 'Carlos Mendes',
    authorAvatar: 'https://i.pravatar.cc/150?u=carlos',
    date: '15 Jan 2026',
    readTimeMinutes: 5,
    views: 890,
    icon: '📄'
  },
  {
    id: '3',
    title: 'Como transferir um Ticket?',
    excerpt: 'Passo a passo para enviar um atendimento de Nível 1 para o Suporte Técnico.',
    content: 'No módulo de Tickets, clique no botão Transferir no canto superior direito...',
    category: ArticleCategory.TUTORIAL,
    authorName: 'Fernanda Lima',
    authorAvatar: 'https://i.pravatar.cc/150?u=fernanda',
    date: '02 Mar 2026',
    readTimeMinutes: 3,
    views: 2150,
    icon: '🔄'
  },
  {
    id: '4',
    title: 'Dúvidas sobre Faturamento',
    excerpt: 'Respostas prontas para clientes perguntando sobre 2ª via de boleto e PIX.',
    content: 'Para enviar a 2ª via, acesse o painel financeiro...',
    category: ArticleCategory.FAQ,
    authorName: 'Ana Silva',
    authorAvatar: 'https://i.pravatar.cc/150?u=ana',
    date: '20 Fev 2026',
    readTimeMinutes: 4,
    views: 3400,
    icon: '💳'
  }
];

export const kbServices = {
  async getArticles(): Promise<IKbArticle[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockArticles), 300));
  }
};