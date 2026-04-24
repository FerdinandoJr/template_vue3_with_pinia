import type { IKanbanCard, IKanbanTag } from "../domain/entities/kanban-card";
import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface KanbanBoard {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  color: string;
  boardId: string;
  cards?: IKanbanCard[];
}

export const kanbanServices = {
  async fetchBoards(): Promise<KanbanBoard[]> {
    const response = await httpClient.get<ApiResponse<KanbanBoard[]>>('/kanban/boards');
    return response.data;
  },

  async createBoard(data: { title: string }): Promise<KanbanBoard> {
    const response = await httpClient.post<ApiResponse<KanbanBoard>>('/kanban/boards', data);
    return response.data;
  },

  async updateBoard(id: string, data: { title: string }): Promise<KanbanBoard> {
    const response = await httpClient.put<ApiResponse<KanbanBoard>>(`/kanban/boards/${id}`, data);
    return response.data;
  },

  async deleteBoard(id: string): Promise<void> {
    await httpClient.delete(`/kanban/boards/${id}`);
  },

  async fetchColumnsByBoard(boardId: string): Promise<KanbanColumn[]> {
    const response = await httpClient.get<ApiResponse<KanbanColumn[]>>(`/kanban/columns/${boardId}`);
    return response.data;
  },

  async fetchAllColumns(): Promise<KanbanColumn[]> {
    const response = await httpClient.get<ApiResponse<KanbanColumn[]>>('/kanban/columns');
    return response.data;
  },

  async fetchKanbanData(): Promise<any[]> {
    const boards = await this.fetchBoards();
    const allColumns = await this.fetchAllColumns();
    const cardsResponse = await httpClient.get<ApiResponse<IKanbanCard[]>>('/kanban/cards');
    const cards = cardsResponse.data;

    return boards.map(board => ({
      ...board,
      columns: allColumns
        .filter(col => col.boardId === board.id)
        .map(col => ({
          ...col,
          cards: cards.filter(card => (card as any).columnId === col.id),
        }))
        .sort((a, b) => a.order - b.order),
    }));
  },

  async createColumn(data: { title: string; boardId: string; order?: number; color?: string }): Promise<KanbanColumn> {
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

  async reorderColumns(boardId: string, columnIds: string[]): Promise<KanbanColumn[]> {
    const response = await httpClient.put<ApiResponse<KanbanColumn[]>>(`/kanban/columns/reorder/${boardId}`, columnIds);
    return response.data;
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
      await this.updateBoard(board.id, { title: board.title });
      for (const column of board.columns || []) {
        await this.updateColumn(column.id, { title: column.title, order: column.order, color: column.color });
      }
    }
  },
};