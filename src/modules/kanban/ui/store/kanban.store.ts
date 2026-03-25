import { defineStore } from 'pinia';
import { kanbanServices } from '../../data/kanban.services';
import { ElMessage } from 'element-plus';

export const useKanbanStore = defineStore('kanban', {
  state: () => ({
    columns: [] as any[],
    loading: false
  }),

  actions: {
    async fetchKanbanData() {
      this.loading = true;
      try {
        const data = await kanbanServices.fetchKanbanData();
        this.columns = data;
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
      await kanbanServices.updateColumns(this.columns);
    },

    async addColumn() {
      const newColumnId = `col-${Date.now()}`;

      this.columns.push({
        id: newColumnId,
        title: 'Nova Lista',
        color: '#94a3b8',
        cards: [],
        items: [],
        tasks: [],
        list: []
      });

      await this.saveBoard();
      ElMessage.success('Nova lista adicionada com sucesso!');
    },

    async removeColumn(id: string) {
      this.columns = this.columns.filter((col: any) => col.id !== id);

      await this.saveBoard();
      ElMessage.success('Lista removida com sucesso!');
    }
  }
});