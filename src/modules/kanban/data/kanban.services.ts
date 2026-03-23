import type { IKanbanCard } from "../domain/entities/kanban-card";
import { KanbanStatus } from "../domain/valueObjects/kanban-status.enum";

const mock: IKanbanCard[] = [
  { 
    id: '1', 
    title: 'Implementação Login', 
    description: 'Criar tela de login com Auth0', 
    customerName: 'Cliente A', 
    status: KanbanStatus.TODO,
    priority: 'high',
    dateDisplay: '19/06/24',
    avatars: ['LL'],
    tags: [
      { label: 'Login', colorClass: 'bg-green-100 text-green-600' },
      { label: 'Dev', colorClass: 'bg-blue-100 text-blue-600' }
    ]
  },
  { 
    id: '2', 
    title: 'Correção do Bug X', 
    description: 'Erro na api de clientes', 
    customerName: 'Cliente B', 
    status: KanbanStatus.IN_PROGRESS,
    priority: 'medium',
    dateDisplay: 'Hoje',
    avatars: ['WA'],
    tags: [
      { label: 'Bug', colorClass: 'bg-red-100 text-red-600' },
      { label: 'Critical', colorClass: 'bg-pink-100 text-pink-600' }
    ]
  }
];

export const kanbanServices = {
  async list(): Promise<IKanbanCard[]> {
    return new Promise(resolve => setTimeout(() => resolve([...mock]), 400));
  },
  async updateStatus(cardId: string, newStatus: KanbanStatus): Promise<void> {
    return new Promise(resolve => {
      const card = mock.find(c => c.id === cardId);
      if (card) card.status = newStatus;
      resolve();
    });
  },
  async createCard(data: Omit<IKanbanCard, 'id'>): Promise<IKanbanCard> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newCard: IKanbanCard = {
          ...data,
          id: Date.now().toString()
        };
        mock.push(newCard);
        resolve(newCard);
      }, 300);
    });
  }
};