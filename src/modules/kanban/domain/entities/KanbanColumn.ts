import type { KanbanTask } from "./KanbanTask";

export interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    tasks: KanbanTask[];
}