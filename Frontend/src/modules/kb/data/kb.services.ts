import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
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
  status: string;
  visibility: string;
}

export interface IKbCategory {
  id: string;
  name: string;
}

interface GetArticlesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  role?: string;
}

export const kbServices = {
  async getArticles(params?: GetArticlesParams): Promise<IKbArticle[]> {
    const queryParams = new URLSearchParams();
    if (params?.category && params.category !== 'Todas') {
      queryParams.append('category', params.category);
    }
    if (params?.search) {
      queryParams.append('q', params.search);
    }
    const queryString = queryParams.toString();
    const url = queryString ? `/kb?${queryString}` : '/kb';
    const response = await httpClient.get<ApiResponse<IKbArticle[]>>(url);
    return response.data;
  },

  async getCategories(): Promise<IKbCategory[]> {
    const response = await httpClient.get<ApiResponse<IKbCategory[]>>('/kb/categories');
    return response.data || [];
  },

  async createCategory(name: string): Promise<IKbCategory> {
    const response = await httpClient.post<ApiResponse<IKbCategory>>('/kb/categories', { name });
    return response.data;
  },

  async updateCategory(id: string, name: string): Promise<IKbCategory> {
    const response = await httpClient.put<ApiResponse<IKbCategory>>(`/kb/categories/${id}`, { name });
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await httpClient.delete(`/kb/categories/${id}`);
  },

  async getArticle(id: string): Promise<IKbArticle> {
    const response = await httpClient.get<ApiResponse<IKbArticle>>(`/kb/${id}`);
    return response.data;
  },

  async searchArticles(query: string): Promise<IKbArticle[]> {
    const response = await httpClient.get<ApiResponse<IKbArticle[]>>(`/kb/search?q=${query}`);
    return response.data;
  },

  async createArticle(data: Partial<IKbArticle>): Promise<IKbArticle> {
    const response = await httpClient.post<ApiResponse<IKbArticle>>('/kb', data);
    return response.data;
  },

  async updateArticle(id: string, data: Partial<IKbArticle>): Promise<IKbArticle> {
    const response = await httpClient.put<ApiResponse<IKbArticle>>(`/kb/${id}`, data);
    return response.data;
  },

  async deleteArticle(id: string): Promise<void> {
    await httpClient.delete(`/kb/${id}`);
  },
};