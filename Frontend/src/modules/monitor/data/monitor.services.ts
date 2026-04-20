import type { IMonitorChat } from "@/modules/monitor/domain/entities/MonitorChat";

const mockChats: IMonitorChat[] = [
    { id: 1, customer: 'Empresa Alpha Ltda', department: 'Suporte N2', status: 'Em Atendimento', waitTime: 120, serviceTime: 450, agentId: '1', agentName: 'Carlos Silva' },
    { id: 2, customer: 'Comercial Silva', department: 'Suporte N2', status: 'Aguardando', waitTime: 320, serviceTime: 0, agentId: '1', agentName: 'Carlos Silva' },
    { id: 3, customer: 'Tech Store', department: 'Suporte N2', status: 'Finalizado', waitTime: 45, serviceTime: 1800, agentId: '1', agentName: 'Carlos Silva' },
    { id: 4, customer: 'Varejo Bom Preço', department: 'Suporte N2', status: 'Finalizado', waitTime: 12, serviceTime: 650, agentId: '1', agentName: 'Carlos Silva' },
    { id: 5, customer: 'João Mendes', department: 'Suporte N1', status: 'Em Atendimento', waitTime: 15, serviceTime: 980, agentId: '2', agentName: 'Ana Paula' },
    { id: 6, customer: 'Clínica Saúde', department: 'Suporte N1', status: 'Finalizado', waitTime: 30, serviceTime: 1200, agentId: '2', agentName: 'Ana Paula' },
    { id: 7, customer: 'Maria Oliveira', department: 'Vendas', status: 'Em Atendimento', waitTime: 50, serviceTime: 120, agentId: '3', agentName: 'Marcos Costa' },
    { id: 8, customer: 'Borges & Cia', department: 'Vendas', status: 'Finalizado', waitTime: 10, serviceTime: 340, agentId: '3', agentName: 'Marcos Costa' },
    { id: 9, customer: 'Logística Express', department: 'Vendas', status: 'Finalizado', waitTime: 5, serviceTime: 890, agentId: '3', agentName: 'Marcos Costa' },
    { id: 10, customer: 'Indústria XPTO', department: 'Financeiro', status: 'Aguardando', waitTime: 850, serviceTime: 0, agentId: '0', agentName: 'Fila de Espera (Sem Atendente)' },
    { id: 11, customer: 'Supermercado Vida', department: 'Suporte N1', status: 'Aguardando', waitTime: 410, serviceTime: 0, agentId: '0', agentName: 'Fila de Espera (Sem Atendente)' },
];

export const monitorServices = {
    async fetchAllChats(): Promise<IMonitorChat[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockChats);
            }, 500);
        });
    }
};