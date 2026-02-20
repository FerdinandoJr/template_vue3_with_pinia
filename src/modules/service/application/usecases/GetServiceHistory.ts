import type { IServiceRepository } from "../../domain/repositories/IServiceRepository";

export class GetServiceHistory {
    constructor(private readonly repository: IServiceRepository) {}

    async execute() {
        return await this.repository.getAll();
    }
}