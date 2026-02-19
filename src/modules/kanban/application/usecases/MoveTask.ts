import type { IKanbanRepository } from "../../domain/repositories/IKanbanRepository";

export class MoveTask {
    constructor(private readonly repository: IKanbanRepository) {}

    async execute(taskId: number, sourceColId: string, targetColId: string) {
        await this.repository.moveTask(taskId, sourceColId, targetColId);
    }
}