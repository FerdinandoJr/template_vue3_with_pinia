export interface ICalendarEvent {
  id: string;
  date: string;
  time: string;
  endTime?: string;
  title: string;
  client: string;
  assigneeInitials: string;
  assigneeName: string;
  colorClass: string;
  dotClass: string;
  userId?: string;
  description?: string;
  postMeetingNotes?: string;
  participants?: string[];
  createdBy?: string;
  groupId?: string;
  isRecurringInstance?: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
  recurrenceEndDate?: string;
  recurrenceDays?: number[];

  cep?: string;
  address?: string;
}

export interface IClosedDay {
  id: string;
  date: string;
  reason?: string;
  userId?: string;
}