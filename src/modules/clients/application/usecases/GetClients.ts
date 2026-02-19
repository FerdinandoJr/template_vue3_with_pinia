import type { Client } from "../../domain/entities/Client";
import type { IClientRepository } from "../../domain/repositories/IClientRepository";

export class GetClients {
    constructor(private readonly repository: IClientRepository) {}

    async execute(): Promise<Client[]> {
        return await this.repository.getAll();
    }
}