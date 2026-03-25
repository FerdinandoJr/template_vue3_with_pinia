import { KanbanStatus } from '../domain/valueObjects/kanban-status.enum';

const STORAGE_KEY = '@DataCRM:KanbanBoard_v5';

const ensureColumnsHaveColor = (columns: any[]) => {
  return columns.map(col => {
    if (!col.color) {
      if (col.id === KanbanStatus.TODO || col.id === 'todo') col.color = '#64748b';
      else if (col.id === KanbanStatus.IN_PROGRESS || col.id === 'in-progress') col.color = '#3b82f6';
      else if (col.id === KanbanStatus.DONE || col.id === 'done') col.color = '#22c55e';
      else col.color = '#94a3b8';
    }
    if (!col.cards) col.cards = [];
    col.items = col.cards;
    col.tasks = col.cards;
    col.list = col.cards;
    return col;
  });
};

const getDefaultColumns = () => {
  const todoList = [
    {
      id: '1', title: 'Implementação Funcionalidade', description: 'Criar nova tela de cadastro',
      customerName: 'Cliente A', status: KanbanStatus.TODO, priority: 'high',
      dateDisplay: '19/06/24', avatars: ['LL'], tags: [
        { label: 'Nova Funcionalidade', colorClass: 'bg-green-100 text-green-700' },
        { label: 'Urgente', colorClass: 'bg-orange-100 text-orange-700' }
      ]
    }
  ];

  const inProgressList = [
    {
      id: '2', title: 'Correção de Erro', description: 'Erro na api de clientes',
      customerName: 'Cliente B', status: KanbanStatus.IN_PROGRESS, priority: 'medium',
      dateDisplay: 'Hoje', avatars: ['WA'], tags: [
        { label: 'Bug', colorClass: 'bg-red-100 text-red-700' },
        { label: 'Crítico', colorClass: 'bg-pink-100 text-pink-700' }
      ]
    }
  ];

  return [
    { id: KanbanStatus.TODO, title: 'A Fazer', color: '#64748b', cards: todoList, items: todoList, tasks: todoList, list: todoList },
    { id: KanbanStatus.IN_PROGRESS, title: 'Em Andamento', color: '#3b82f6', cards: inProgressList, items: inProgressList, tasks: inProgressList, list: inProgressList },
    { id: KanbanStatus.DONE, title: 'Concluído', color: '#22c55e', cards: [], items: [], tasks: [], list: [] }
  ];
};

export const kanbanServices = {
  async fetchKanbanData(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          let parsedData = JSON.parse(localData);
          parsedData = ensureColumnsHaveColor(parsedData);
          resolve(parsedData);
        } else {
          const defaultColumns = getDefaultColumns();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultColumns));
          resolve(defaultColumns);
        }
      }, 300);
    });
  },

  async createCard(card: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const localData = localStorage.getItem(STORAGE_KEY);
        let columns = localData ? ensureColumnsHaveColor(JSON.parse(localData)) : getDefaultColumns();

        const todoColumn = columns.find((col: any) => col.id === KanbanStatus.TODO || col.id === 'todo');
        if (todoColumn) todoColumn.cards.push(card);
        else if (columns.length > 0) columns[0].cards.push(card);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
        resolve(card);
      }, 200);
    });
  },

  async updateColumns(columns: any[]): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const safeColumns = ensureColumnsHaveColor(columns);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeColumns));
        resolve(true);
      }, 100);
    });
  }
};