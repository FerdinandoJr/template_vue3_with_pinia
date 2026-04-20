import { defineStore } from 'pinia';
import { kanbanServices } from '../../data/kanban.services';
import { ElMessage } from 'element-plus';

export const useKanbanStore = defineStore('kanban', {
  state: () => ({
    boards: [] as any[],
    activeBoardId: null as string | null,
    loading: false
  }),
  getters: {
    columns: (state) => {
      const board = state.boards.find(b => b.id === state.activeBoardId);
      return board ? board.columns : [];
    },
    activeBoard: (state) => state.boards.find(b => b.id === state.activeBoardId)
  },
  actions: {
    async fetchKanbanData() {
      this.loading = true;
      try {
        const data = await kanbanServices.fetchKanbanData();
        this.boards = data;
        if (this.boards.length > 0 && !this.activeBoardId) {
          this.activeBoardId = this.boards[0].id;
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Kanban:", error);
      } finally {
        this.loading = false;
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
      const newBoard = {
        id: `board-${Date.now()}`,
        title: title,
        columns: [
          { id: 'todo', title: 'A Fazer', color: '#64748b', cards: [], items: [], tasks: [], list: [] },
          { id: 'in-progress', title: 'Em Andamento', color: '#3b82f6', cards: [], items: [], tasks: [], list: [] },
          { id: 'done', title: 'Concluído', color: '#22c55e', cards: [], items: [], tasks: [], list: [] }
        ]
      };
      this.boards.push(newBoard);
      this.activeBoardId = newBoard.id;
      await this.saveBoard();
      ElMessage.success('Novo quadro criado com sucesso!');
    },

    async removeBoard(id: string) {
      this.boards = this.boards.filter(b => b.id !== id);
      if (this.activeBoardId === id) {
        this.activeBoardId = this.boards.length > 0 ? this.boards[0].id : null;
      }
      await this.saveBoard();
      ElMessage.success('Quadro removido com sucesso!');
    },

    async addColumn() {
      const board = this.boards.find(b => b.id === this.activeBoardId);
      if (board) {
        const newColumnId = `col-${Date.now()}`;
        board.columns.push({ id: newColumnId, title: 'Nova Lista', color: '#94a3b8', cards: [], items: [], tasks: [], list: [] });
        await this.saveBoard();
        ElMessage.success('Nova lista adicionada com sucesso!');
      }
    },

    async removeColumn(id: string) {
      const board = this.boards.find(b => b.id === this.activeBoardId);
      if (board) {
        board.columns = board.columns.filter((col: any) => col.id !== id);
        await this.saveBoard();
        ElMessage.success('Lista removida com sucesso!');
      }
    }
  }
});