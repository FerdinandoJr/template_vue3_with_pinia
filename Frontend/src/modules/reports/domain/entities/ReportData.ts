export interface IAgentPerformance {
    agentId: string;
    name: string;
    totalChats: number;
    completedChats: number;
    avgServiceTime: string;
    satisfactionScore: number;
}

export interface IDepartmentVolume {
    department: string;
    count: number;
    percentage: number;
}

export interface ISlaMetrics {
    withinSla: number;
    exceededSla: number;
    avgWaitTime: string;
}