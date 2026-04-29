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
    const response: ApiResponse<KanbanBoard[]> = await httpClient.get('/kanban/boards');
    return response.data;
  },

  async createBoard(data: { title: string }): Promise<KanbanBoard> {
    const response: ApiResponse<KanbanBoard> = await httpClient.post('/kanban/boards', data);
    return response.data;
  },

  async updateBoard(id: string, data: { title: string }): Promise<KanbanBoard> {
    const response: ApiResponse<KanbanBoard> = await httpClient.put(`/kanban/boards/${id}`, data);
    return response.data;
  },

  async deleteBoard(id: string): Promise<void> {
    console.log('[KanbanServices] deleteBoard chamado para id:', id);
    const response = await httpClient.delete(`/kanban/boards/${id}`);
    console.log('[KanbanServices] deleteBoard resposta:', response);
  },

  async fetchColumnsByBoard(boardId: string): Promise<KanbanColumn[]> {
    const response: ApiResponse<KanbanColumn[]> = await httpClient.get(`/kanban/columns/${boardId}`);
    return response.data;
  },

  async fetchAllColumns(): Promise<KanbanColumn[]> {
    const response: ApiResponse<KanbanColumn[]> = await httpClient.get('/kanban/columns');
    return response.data;
  },

  async fetchKanbanData(): Promise<any[]> {
    const boards = await this.fetchBoards();
    const allColumns = await this.fetchAllColumns();
    const cardsResponse: ApiResponse<IKanbanCard[]> = await httpClient.get('/kanban/cards');
    const cards = cardsResponse.data;

    return boards.map(board => ({
      ...board,
      columns: allColumns
        .filter(col => col.boardId === board.id)
        .map(col => ({
          ...col,
          cards: cards.filter((card: IKanbanCard) => card.columnId === col.id),
        }))
        .sort((a, b) => a.order - b.order),
    }));
  },

  async createColumn(data: { title: string; boardId: string; order?: number; color?: string }): Promise<KanbanColumn> {
    const response: ApiResponse<KanbanColumn> = await httpClient.post('/kanban/columns', data);
    return response.data;
  },

  async updateColumn(id: string, data: Partial<KanbanColumn>): Promise<KanbanColumn> {
    const response: ApiResponse<KanbanColumn> = await httpClient.put(`/kanban/columns/${id}`, data);
    return response.data;
  },

  async deleteColumn(id: string): Promise<void> {
    await httpClient.delete(`/kanban/columns/${id}`);
  },

  async reorderColumns(boardId: string, columnIds: string[]): Promise<KanbanColumn[]> {
    const response: ApiResponse<KanbanColumn[]> = await httpClient.put(`/kanban/columns/reorder/${boardId}`, columnIds);
    return response.data;
  },

  async createCard(data: Partial<IKanbanCard>): Promise<IKanbanCard> {
    const response: ApiResponse<IKanbanCard> = await httpClient.post('/kanban/cards', data);
    return response.data;
  },

  async updateCard(id: string, data: Partial<IKanbanCard>): Promise<IKanbanCard> {
    const response: ApiResponse<IKanbanCard> = await httpClient.put(`/kanban/cards/${id}`, data);
    return response.data;
  },

  async deleteCard(id: string): Promise<void> {
    await httpClient.delete(`/kanban/cards/${id}`);
  },

  async moveCard(id: string, targetColumnId: string, targetOrder: number): Promise<IKanbanCard> {
    const response: ApiResponse<IKanbanCard> = await httpClient.put(`/kanban/cards/${id}/move`, {
      targetColumnId,
      targetOrder
    });
    return response.data;
  },

  async reorderCardsInColumn(columnId: string, cardIds: string[]): Promise<void> {
    await httpClient.put(`/kanban/columns/${columnId}/cards/reorder`, cardIds);
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