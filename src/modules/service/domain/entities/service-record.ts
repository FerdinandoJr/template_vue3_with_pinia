import { ServiceStatus, ServicePriority } from '@/modules/service/domain/valueObjects/service-status.enum'

export interface IServiceItem {
  id: string;
  protocol: string;
  customerName: string;
  subject: string;
  description: string;
  status: ServiceStatus;
  priority: ServicePriority;
  startedAt: number;
  finishedAt?: number;
  accumulatedTime: number;
  lastResumedAt?: number;
}