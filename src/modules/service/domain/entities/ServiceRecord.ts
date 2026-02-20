export type ServiceStatus = "active" | "inactive" | "pending";

export interface ServiceRecord {
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
