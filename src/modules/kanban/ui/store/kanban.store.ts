import { defineStore } from "pinia";
import type { IKanbanCard } from "../../domain/entities/kanban-card";
import { KanbanStatus } from "../../domain/valueObjects/kanban-status.enum";
import { kanbanServices } from "../../data/kanban.services";

interface KanbanState {
  items: IKanbanCard[];
  loading: boolean;
}

export const useKanbanStore = defineStore('kanban', {
  state: (): KanbanState => ({
    items: [],
    loading: false
  }),

  getters: {
    todoCards: (state) => state.items.filter(c => c.status === KanbanStatus.TODO),
    inProgressCards: (state) => state.items.filter(c => c.status === KanbanStatus.IN_PROGRESS),
    reviewCards: (state) => state.items.filter(c => c.status === KanbanStatus.REVIEW),
    doneCards: (state) => state.items.filter(c => c.status === KanbanStatus.DONE),
  },

  actions: {
    async fetchCards() {
      this.loading = true;
      try {
        this.items = await kanbanServices.list();
      } catch (error) {
        console.error("Erro ao carregar Kanban:", error);
      } finally {
        this.loading = false;
      }
    },

    async moveCard(cardId: string, newStatus: KanbanStatus) {
      const card = this.items.find(c => c.id === cardId);
      if (card) {
        const oldStatus = card.status;
        card.status = newStatus;

        try {
          await kanbanServices.updateStatus(cardId, newStatus);
        } catch (error) {
          card.status = oldStatus;
          console.error("Erro ao mover card:", error);
        }
      }
    },

    addCard(card: Omit<IKanbanCard, 'id' | 'dateDisplay'>) {
      const newCard: IKanbanCard = {
        ...card,
        id: Math.random().toString(36).substr(2, 9), 
        dateDisplay: 'Agora mesmo'
      };
      
      this.items.unshift(newCard);
    }
  }
});