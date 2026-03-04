export interface IAgendaEvent {
  id: string;
  date: string;
  time: string;
  endTime: string;
  title: string;
  client: string;
  assigneeInitials: string;
  assigneeName: string;
  colorClass: string;
  dotClass: string;
  userId?: string;
  description?: string;
  participants?: string[];
  createdBy?: string;
  groupId?: string;
  isRecurringInstance?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
  recurrenceEndDate?: string;
  recurrenceDays?: number[];
}

export interface IClosedDay {
  date: string;
}