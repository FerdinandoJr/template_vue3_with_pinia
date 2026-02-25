import type { ArticleCategory } from "../valueObjects/kb-enums";

export interface IKbArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  authorName: string;
  authorAvatar: string;
  date: string;
  readTimeMinutes: number;
  views: number;
  icon: string;
}