export interface IAgendaEvent {
  id: string;
  date: string; 
  time: string; 
  title: string;
  client: string;
  assigneeInitials: string; 
  assigneeName: string; 
  colorClass: string; 
  dotClass: string; 
}

export interface IClosedDay {
  date: string; 
}