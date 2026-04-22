import type { IKanbanCard, IKanbanTag } from "../domain/entities/kanban-card";
import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  color: string;
  cards?: IKanbanCard[];
}

export const kanbanServices = {
  async fetchKanbanData(): Promise<any[]> {
    const columnsResponse = await httpClient.get<ApiResponse<KanbanColumn[]>>('/kanban/columns');
    const cardsResponse = await httpClient.get<ApiResponse<IKanbanCard[]>>('/kanban/cards');
    
    const columns = columnsResponse.data;
    const cards = cardsResponse.data;
    
    // Agrupar cards por coluna
    return columns.map(column => ({
      ...column,
      cards: cards.filter(card => (card as any).columnId === column.id),
    }));
  },

  async createColumn(data: { title: string; order?: number; color?: string }): Promise<KanbanColumn> {
    const response = await httpClient.post<ApiResponse<KanbanColumn>>('/kanban/columns', data);
    return response.data;
  },

  async updateColumn(id: string, data: Partial<KanbanColumn>): Promise<KanbanColumn> {
    const response = await httpClient.put<ApiResponse<KanbanColumn>>(`/kanban/columns/${id}`, data);
    return response.data;
  },

  async deleteColumn(id: string): Promise<void> {
    await httpClient.delete(`/kanban/columns/${id}`);
  },

  async createCard(data: Partial<IKanbanCard>): Promise<IKanbanCard> {
    const response = await httpClient.post<ApiResponse<IKanbanCard>>('/kanban/cards', data);
    return response.data;
  },

  async updateCard(id: string, data: Partial<IKanbanCard>): Promise<IKanbanCard> {
    const response = await httpClient.put<ApiResponse<IKanbanCard>>(`/kanban/cards/${id}`, data);
    return response.data;
  },

  async deleteCard(id: string): Promise<void> {
    await httpClient.delete(`/kanban/cards/${id}`);
  },

  async updateBoards(boards: any[]): Promise<void> {
    for (const board of boards) {
      for (const column of board.columns || []) {
        await this.updateColumn(column.id, { title: column.title, order: column.order, color: column.color });
      }
    }
  },
};