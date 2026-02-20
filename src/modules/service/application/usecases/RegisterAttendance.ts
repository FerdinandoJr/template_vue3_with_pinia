import type { ServiceRecord } from "../../domain/entities/ServiceRecord";
import type { IServiceRepository } from "../../domain/repositories/IServiceRepository";

export class RegisterAttendance {
    constructor(private readonly repository: IServiceRepository) {}

    async execute(data: Omit<ServiceRecord, 'id' | 'dateTime'>): Promise<void> {
        const newRecord: ServiceRecord = {
            ...data,
            id: Math.floor(100000 + Math.random() * 900000).toString(),
            dateTime: new Date().toISOString()
        };
        await this.repository.create(newRecord);
    }
}