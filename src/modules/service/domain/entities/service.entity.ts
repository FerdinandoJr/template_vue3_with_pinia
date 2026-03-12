import { ServiceStatus, ServicePriority } from '../valueObjects/service.enum';

export interface IServiceHistory {
    date: string;
    title: string;
    description: string;
    author: string;
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    color?: string;
    attachment?: string;
}

export interface IServiceItem {
    id: string;
    protocol: string;
    customerName: string;
    document?: string;
    email?: string;
    subject: string;
    lastAction: string;
    status: ServiceStatus | string;
    priority: ServicePriority | string;
    timeElapsed: string;
    createdAt: string;
    history: IServiceHistory[];
    description?: string;
    lastResumedAt?: number;
    accumulatedTime?: number;
}