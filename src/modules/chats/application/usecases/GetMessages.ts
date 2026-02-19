import type { IChatRepository } from "../../domain/repositories/IChatRepository";

export class GetMessages {
    constructor(private readonly repository: IChatRepository) {}

    async execute(contactId: number) {
        return await this.repository.getMessages(contactId);
    }
}