import type { IKbRepository } from "../../domain/repositories/IKbRepository";

export class GetCategories {
    constructor(private readonly repository: IKbRepository) {}

    async execute(): Promise<string[]> {
        return await this.repository.getCategories();
    }
}