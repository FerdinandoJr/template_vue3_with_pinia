import type { Article } from "../entities/Article";

export interface IKbRepository {
    getCategories(): Promise<string[]>;
    getArticles(): Promise<Article[]>;
}