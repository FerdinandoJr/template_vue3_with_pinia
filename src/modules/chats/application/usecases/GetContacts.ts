import type { IChatRepository } from "../../domain/repositories/IChatRepository";

export class GetContacts {
    constructor(private readonly repository: IChatRepository) {}

    async execute() {
        return await this.repository.getContacts();
    }
}