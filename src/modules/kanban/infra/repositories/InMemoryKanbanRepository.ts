import type { KanbanColumn } from "../../domain/entities/KanbanColumn";
import type { IKanbanRepository } from "../../domain/repositories/IKanbanRepository";

export class InMemoryKanbanRepository implements IKanbanRepository {
    private board: KanbanColumn[] = [
        {
            id: 'todo',
            title: 'A Fazer',
            color: '',
            tasks: [
                { id: 1, title: 'Implementação Login', description: 'Criar tela de login com Auth0', priority: 'medium', tags: ['Login', 'Dev'], date: '15/05/24', assigneeAvatar: ['US'] },
                { id: 2, title: 'Atualizar Design', description: 'Refazer paleta de cores', priority: 'medium', tags: ['Design', 'UI'], date: '20/05/24', assigneeAvatar: ['US', 'AD'] }
            ]
        },
        {
            id: 'doing',
            title: 'Em Progresso',
            color: '',
            tasks: [
                { id: 3, title: 'Correção do Bug X', description: 'Erro na api de clientes', priority: 'high', tags: ['Bug', 'Critical'], date: 'Hoje', assigneeAvatar: ['US'] },
                { id: 4, title: 'Integração API', description: 'Conectar com gateway', priority: 'high', tags: ['API', 'Dev'], date: 'Ontem', assigneeAvatar: ['US', 'AD'] }
            ]
        },
        {
            id: 'review',
            title: 'Em Revisão',
            color: '',
            tasks: [
                { id: 5, title: 'Serviço de Mensageria', description: 'Configurar filas RabbitMQ', priority: 'low', tags: ['Infra'], date: '12/05/24', assigneeAvatar: ['US'] }
            ]
        },
        {
            id: 'done',
            title: 'Concluído',
            color: '',
            tasks: [
                { id: 6, title: 'Lançamento V2', description: 'Deploy em produção', priority: 'medium', tags: ['Deploy'], date: '10/05/24', assigneeAvatar: ['US', 'AD'] },
                { id: 7, title: 'Documentação Final', description: 'Escrever readme.md', priority: 'low', tags: ['Docs'], date: '01/05/24', assigneeAvatar: ['US'] }
            ]
        }
    ];

    async getBoard(): Promise<KanbanColumn[]> {
        return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(this.board))), 300));
    }

    async moveTask(taskId: number, sourceColId: string, targetColId: string): Promise<void> {
        return new Promise(resolve => {
            const sourceCol = this.board.find(c => c.id === sourceColId);
            const targetCol = this.board.find(c => c.id === targetColId);

            if (sourceCol && targetCol) {
                const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    const [task] = sourceCol.tasks.splice(taskIndex, 1);
                    if (task) targetCol.tasks.push(task);
                }
            }
            resolve();
        });
    }
}