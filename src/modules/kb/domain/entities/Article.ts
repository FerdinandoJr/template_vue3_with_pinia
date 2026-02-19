export interface Article {
    id: number;
    title: string;
    category: string;
    excerpt: string;
    content?: string;
    readingTime: string;
    updatedAt: string;
}