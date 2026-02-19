import type { Client } from "../entities/Client";

export interface IClientRepository {
    getAll(): Promise<Client[]>;
}