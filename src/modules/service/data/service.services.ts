import type { IServiceRecord } from "../domain/entities/service-record";
import { ServiceStatus } from "../domain/valueObjects/service-status.enum";

export interface ServiceFilter {
  query?: string;
}

export interface Paginated<T> {
  total: number;
  filteredTotal: number;
  items: T[];
}

const mock: IServiceRecord[] = [
  { id: '012452', companyName: 'Tech Solutions Ltda', cnpj: '57.156.369/0001-05', dateTime: '13/02/2026 - 14:02', agentName: 'Lorenzo Assunção', status: ServiceStatus.ACTIVE, reason: 'Suporte', duration: '15m' },
  { id: '132566', companyName: 'Robrits Solutions Ltda', cnpj: '87.854.821/0001-73', dateTime: '09/02/2026 - 16:10', agentName: 'Carla Ferreira', status: ServiceStatus.ACTIVE, reason: 'Financeiro', duration: '10m' },
];

export const serviceDeskServices = {
  async list(filter: ServiceFilter): Promise<Paginated<IServiceRecord>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mock];
        
        if (filter.query) {
          const q = filter.query.toLowerCase();
          filtered = filtered.filter(r => 
            r.companyName.toLowerCase().includes(q) || 
            r.id.includes(q)
          );
        }

        resolve({
          total: mock.length,
          filteredTotal: filtered.length,
          items: filtered
        });
      }, 300);
    });
  },

  async create(record: Omit<IServiceRecord, 'id' | 'dateTime'>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord: IServiceRecord = {
          ...record,
          id: Math.floor(100000 + Math.random() * 900000).toString(),
          dateTime: new Date().toISOString()
        };
        mock.unshift(newRecord);
        resolve();
      }, 300);
    });
  }
};