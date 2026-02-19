import type { ServiceRecord } from "../../domain/entities/ServiceRecord";
import type { IServiceRepository } from "../../domain/repositories/IServiceRepository";

export class RegisterAttendance {
    constructor(private readonly repository: IServiceRepository) {}

    async execute(data: Omit<ServiceRecord, 'id' | 'dateTime'>): Promise<void> {
        const newRecord: ServiceRecord = {
            ...data,
            id: Math.floor(100000 + Math.random() * 900000).toString(),
            dateTime: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
        await this.repository.create(newRecord);
    }
}