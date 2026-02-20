import type { ServiceRecord } from "../entities/ServiceRecord";

export interface IServiceRepository {
    getAll(): Promise<ServiceRecord[]>;
    create(record: ServiceRecord): Promise<void>;
}