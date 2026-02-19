import type { KanbanColumn } from "../entities/KanbanColumn";

export interface IKanbanRepository {
    getBoard(): Promise<KanbanColumn[]>;
    moveTask(taskId: number, sourceColId: string, targetColId: string): Promise<void>;
}