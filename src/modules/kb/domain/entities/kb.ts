export interface IKbCategory {
  id: string;
  name: string;
}

export interface IKbArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  readTimeMinutes: number;
  views: number;
  icon: string;
  status: 'Rascunho' | 'Publicado' | string;
}