export interface IMonitorChat {
    id: number | string;
    customer: string;
    department: string;
    status: 'Aguardando' | 'Em Atendimento' | 'Bot' | 'Finalizado';
    waitTime: number;
    serviceTime: number;
    agentId: string;
    agentName: string;
}