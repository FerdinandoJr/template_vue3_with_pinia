export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface KanbanTask {
    id: number;
    title: string;
    description?: string;
    priority: TaskPriority;
    tags: string[];
    assigneeAvatar: string[];
    date: string;
}