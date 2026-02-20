import type { ServiceRecord } from "../../domain/entities/ServiceRecord";
import type { IServiceRepository } from "../../domain/repositories/IServiceRepository";

export class InMemoryServiceRepository implements IServiceRepository {
    private records: ServiceRecord[] = [
        { id: '012452', companyName: 'Tech Solutions Ltda', cnpj: '57.156.369/0001-05', dateTime: '13/02/2026 - 14:02', agentName: 'Lorenzo Assunção', status: 'active', reason: 'Suporte', duration: '15m' },
        { id: '132566', companyName: 'Robrits Solutions Ltda', cnpj: '87.854.821/0001-73', dateTime: '09/02/2026 - 16:10', agentName: 'Carla Ferreira', status: 'active', reason: 'Financeiro', duration: '10m' },
        { id: '658425', companyName: 'Marteeis Solutions Ltda', cnpj: '97.070.492/0001-23', dateTime: '01/02/2026 - 09:15', agentName: 'Emanuel Antonio Lima', status: 'inactive', reason: 'Cancelamento', duration: '05m' },
        { id: '325154', companyName: 'Pemaentesos Ltda', cnpj: '96.268.215/0001-67', dateTime: '05/02/2026 - 10:20', agentName: 'Elisa Sophia', status: 'active', reason: 'Dúvida', duration: '20m' },
        { id: '631545', companyName: 'Nica Solutions Ltda', cnpj: '34.392.870/0001-75', dateTime: '07/02/2026 - 11:05', agentName: 'Bruno Rodrigo Porto', status: 'pending', reason: 'Aguardando Retorno', duration: '00m' },
    ];

    async getAll(): Promise<ServiceRecord[]> {
        return new Promise(resolve => setTimeout(() => resolve([...this.records]), 300));
    }

    async create(record: ServiceRecord): Promise<void> {
        this.records.unshift(record);
        return Promise.resolve();
    }
}