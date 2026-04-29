import { defineStore } from 'pinia';
import { kanbanServices } from '../../data/kanban.services';
import { authServices } from '@/modules/auth/data/auth.services';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { ticketServices } from '@/modules/tickets/data/ticket.services';
import { ElMessage } from 'element-plus';

export const useKanbanStore = defineStore('kanban', {
  state: () => ({
    boards: [] as any[],
    activeBoardId: null as string | null,
    loading: false,
    allTickets: [] as any[]
  }),
  getters: {
    columns: (state) => {
      const board = state.boards.find(b => b.id === state.activeBoardId);
      return board ? board.columns : [];
    },
    activeBoard: (state) => state.boards.find(b => b.id === state.activeBoardId),
    getTicketById: (state) => (id: string) => state.allTickets.find(t => String(t.id) === String(id))
  },
  actions: {
    async fetchKanbanData() {
      this.loading = true;
      try {
        console.log('[KanbanStore] fetchKanbanData starting...');
        
        const ticketsData = await ticketServices.list({ page: 1, pageSize: 1000 });
        this.allTickets = ticketsData.items || [];
        console.log('[KanbanStore] tickets loaded:', this.allTickets.length);
        
        const data = await kanbanServices.fetchKanbanData();
        console.log('[KanbanStore] data from API:', data);
        this.boards = data;
        console.log('[KanbanStore] boards after assignment:', this.boards.length);
        
        if (this.boards.length === 0) {
          await this.createDefaultBoard();
        } else {
          const authStore = useAuthStore();
          const defaultBoardId = authStore.user?.defaultBoardId;
          
          if (defaultBoardId && this.boards.some(b => b.id === defaultBoardId)) {
            this.activeBoardId = defaultBoardId;
          } else if (!this.activeBoardId) {
            this.activeBoardId = this.boards[0].id;
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Kanban:", error);
        this.createDefaultBoard();
      } finally {
        this.loading = false;
      }
    },

    async setDefaultBoard(boardId: string) {
      try {
        await authServices.setDefaultBoard(boardId);
        const authStore = useAuthStore();
        authStore.setDefaultBoard(boardId);
        ElMessage.success('Quadro padrão definido com sucesso!');
      } catch (error) {
        console.error("Erro ao definir quadro padrão:", error);
        ElMessage.error('Erro ao definir quadro padrão');
      }
    },

    async createDefaultBoard() {
      try {
        const newBoard = await kanbanServices.createBoard({ title: 'Meu Quadro' });
        this.boards = [{
          ...newBoard,
          columns: [
            { id: 'col-todo', title: 'A Fazer', order: 0, color: '#f59e0b', boardId: newBoard.id, cards: [] },
            { id: 'col-analysis', title: 'Análise', order: 1, color: '#3b82f6', boardId: newBoard.id, cards: [] },
            { id: 'col-dev', title: 'Desenvolvimento', order: 2, color: '#8b5cf6', boardId: newBoard.id, cards: [] },
            { id: 'col-test', title: 'Teste', order: 3, color: '#06b6d4', boardId: newBoard.id, cards: [] },
            { id: 'col-done', title: 'Finalizado', order: 4, color: '#22c55e', boardId: newBoard.id, cards: [] }
          ]
        }];
        this.activeBoardId = newBoard.id;
      } catch (error) {
        console.error("Erro ao criar quadro padrão:", error);
      }
    },

    async fetchCards() {
      await this.fetchKanbanData();
    },

    async addCard(card: any) {
      await this.fetchKanbanData();
    },

    async saveBoard() {
      await kanbanServices.updateBoards(this.boards);
    },

    async createBoard(title: string) {
      try {
        const newBoard = await kanbanServices.createBoard({ title });
        this.boards.push({
          ...newBoard,
          columns: []
        });
        this.activeBoardId = newBoard.id;
        await this.fetchKanbanData();
        ElMessage.success('Novo quadro criado com sucesso!');
      } catch (error) {
        console.error("Erro ao criar quadro:", error);
        ElMessage.error('Erro ao criar quadro');
      }
    },

    async updateBoardTitle(boardId: string, title: string) {
      try {
        await kanbanServices.updateBoard(boardId, { title });
        const board = this.boards.find(b => b.id === boardId);
        if (board) {
          board.title = title;
        }
        ElMessage.success('Quadro atualizado com sucesso!');
      } catch (error) {
        console.error("Erro ao atualizar quadro:", error);
        ElMessage.error('Erro ao atualizar quadro');
      }
    },

    async removeBoard(id: string) {
      console.log('[KanbanStore] removeBoard chamado para id:', id);
      try {
        await kanbanServices.deleteBoard(id);
        console.log('[KanbanStore] deleteBoard executado');
        this.boards = this.boards.filter(b => b.id !== id);
        if (this.activeBoardId === id) {
          this.activeBoardId = this.boards.length > 0 ? this.boards[0].id : null;
        }
        ElMessage.success('Quadro removido com sucesso!');
      } catch (error) {
        console.error("[KanbanStore] Erro ao remover quadro:", error);
        ElMessage.error('Erro ao remover quadro');
      }
    },

    async addColumn() {
      const board = this.boards.find(b => b.id === this.activeBoardId);
      if (board) {
        try {
          const newColumn = await kanbanServices.createColumn({
            title: 'Nova Lista',
            boardId: board.id,
            order: board.columns?.length || 0,
            color: '#94a3b8'
          });
          board.columns = board.columns || [];
          board.columns.push({ ...newColumn, cards: [] });
          ElMessage.success('Nova lista adicionada com sucesso!');
        } catch (error) {
          console.error("Erro ao adicionar coluna:", error);
          ElMessage.error('Erro ao adicionar lista');
        }
      }
    },

    async updateColumn(columnId: string, data: { title?: string; color?: string; order?: number }) {
      try {
        await kanbanServices.updateColumn(columnId, data);
        const board = this.boards.find(b => b.id === this.activeBoardId);
        if (board) {
          const column = board.columns.find((c: any) => c.id === columnId);
          if (column) {
            Object.assign(column, data);
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar coluna:", error);
      }
    },

    async removeColumn(id: string) {
      try {
        await kanbanServices.deleteColumn(id);
        const board = this.boards.find(b => b.id === this.activeBoardId);
        if (board) {
          board.columns = board.columns.filter((col: any) => col.id !== id);
        }
        ElMessage.success('Lista removida com sucesso!');
      } catch (error) {
        console.error("Erro ao remover coluna:", error);
        ElMessage.error('Erro ao remover lista');
      }
    },

    async reorderColumns(columnIds: string[]) {
      try {
        await kanbanServices.reorderColumns(this.activeBoardId!, columnIds);
        await this.fetchKanbanData();
      } catch (error) {
        console.error("Erro ao reordenar colunas:", error);
      }
    }
  }
});