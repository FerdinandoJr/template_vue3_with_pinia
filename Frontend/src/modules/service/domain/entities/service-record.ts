export type ServiceStatus =
  | 'OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELED'
  | 'open' | 'in_progress' | 'finished' | 'canceled';

export interface IServiceRecord {
  id: string | number;
  protocol: string;
  customerName: string;
  document?: string;
  subject: string;
  description?: string;
  status: ServiceStatus;
  createdAt: string;
  finishedAt?: string;
  agentId?: string | number;
  lastAction?: string;
  timeElapsed?: string;
  companyName?: string;
  cnpj?: string;
  dateTime?: string;
  agentName?: string;
}