import { defineStore } from "pinia";
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

interface KanbanState {
  columns: KanbanColumn[];
}

export const useKanbanStore = defineStore('kanban', {
  state: (): KanbanState => ({
    // Colunas iniciais padrão
    columns: [
      { id: 'open', title: 'Abertos (Novos)', color: 'bg-blue-500' },
      { id: 'in_progress', title: 'Em Andamento', color: 'bg-amber-500' },
      { id: 'resolved', title: 'Resolvidos', color: 'bg-green-500' }
    ]
  }),

  actions: {
    // Busca os dados da base de Tickets real
    async fetchKanbanData() {
      const ticketsStore = useTicketsStore();
      if (typeof ticketsStore.fetch === 'function') {
        await ticketsStore.fetch();
      }
    },

    // Autonomia: Criação de novas colunas
    addColumn() {
      const colors = ['bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
      const newId = 'col_' + Date.now();
      const randomColor = colors[Math.floor(Math.random() * colors.length)] || 'bg-blue-500';
      this.columns.push({ id: newId, title: 'Nova Lista', color: randomColor });
    },

    // Autonomia: Remoção de colunas
    removeColumn(id: string) {
      this.columns = this.columns.filter(col => col.id !== id);
    }
  }
});