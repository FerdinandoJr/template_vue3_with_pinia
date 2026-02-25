import type { KanbanStatus } from "../valueObjects/kanban-status.enum";

export interface IKanbanTag {
  label: string;
  colorClass: string;
}

export interface IKanbanCard {
  id: string;
  title: string;
  description: string;
  customerName: string;
  status: KanbanStatus; 
  tags: IKanbanTag[];
  dateDisplay: string;
  avatars: string[];
  priority: 'low' | 'medium' | 'high';
}