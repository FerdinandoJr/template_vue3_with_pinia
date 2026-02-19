import type { IKanbanRepository } from "../../domain/repositories/IKanbanRepository";

export class GetBoard {
    constructor(private readonly repository: IKanbanRepository) {}

    async execute() {
        return await this.repository.getBoard();
    }
}