import type { ServiceStatus } from "../valueObjects/service-status.enum";

export interface IServiceRecord {
  id: string;
  companyName: string;
  cnpj: string;
  dateTime: string;
  agentName: string;
  status: ServiceStatus;
  reason?: string;
  description?: string;
  duration?: string;
}