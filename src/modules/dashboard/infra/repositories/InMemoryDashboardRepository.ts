import type { DashboardData } from "../../domain/entities/DashboardTypes";
import type { IDashboardRepository } from "../../domain/repositories/IDashboardRepository";

export class InMemoryDashboardRepository implements IDashboardRepository {
    async getDashboardData(): Promise<DashboardData> {
        return new Promise(resolve => setTimeout(() => resolve({
            stats: [
                { label: 'Total Tickets', value: '1,248', icon: '🎫', bgClass: 'bg-blue-50 text-blue-600', trend: 12.5 },
                { label: 'Resolvidos', value: '845', icon: '✅', bgClass: 'bg-green-50 text-green-600', trend: 8.2 },
                { label: 'Tempo Médio', value: '1h 15m', icon: '⏳', bgClass: 'bg-amber-50 text-amber-600', trend: -2.4 },
                { label: 'Satisfação', value: '4.8/5', icon: '⭐', bgClass: 'bg-purple-50 text-purple-600', trend: 1.8 },
            ],
            volumeSeries: [
                { name: 'Tickets Criados', data: [31, 40, 28, 51, 42, 109, 100] },
                { name: 'Tickets Resolvidos', data: [11, 32, 45, 32, 34, 52, 41] }
            ],
            statusSeries: [44, 55, 13],
            performanceSeries: [
                { name: 'Atendimentos', data: [44, 55, 41, 67, 22] }
            ],
            recentActivity: [
                { id: 1, userAvatar: 'JS', userName: 'João Silva', action: 'atualizou o ticket', target: '#1234', fromStatus: 'Pendente', toStatus: 'Resolvido', time: 'há 5 min' },
                { id: 2, userAvatar: 'AM', userName: 'Ana Maria', action: 'respondeu o chat', target: 'Fernanda Lima', time: 'há 12 min' },
                { id: 3, userAvatar: 'CP', userName: 'Carlos Pereira', action: 'criou um novo ticket', target: '#1235', time: 'há 30 min' },
                { id: 4, userAvatar: 'JS', userName: 'João Silva', action: 'finalizou atendimento', target: '#1230', time: 'há 1 hora' },
            ]
        }), 600));
    }
}