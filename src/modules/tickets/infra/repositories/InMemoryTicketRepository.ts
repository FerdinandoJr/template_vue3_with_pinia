import type { Ticket } from "../../domain/entities/Ticket";
import type { ITicketRepository } from "../../domain/repositories/ITicketRepository";

export class InMemoryTicketRepository implements ITicketRepository {

    private tickets: Ticket[] = [
        { id: 1, title: 'Problema com login', customer: 'João Silva', status: 'open', priority: 'high', createdAt: new Date('2026-02-17') },
        { id: 2, title: 'Erro ao processar pagamento', customer: 'Maria Santos', status: 'in-progress', priority: 'urgent', createdAt: new Date('2026-02-17') },
        { id: 3, title: 'Dúvida sobre funcionalidade', customer: 'Pedro Costa', status: 'open', priority: 'low', createdAt: new Date('2026-02-16') },
        { id: 4, title: 'Sistema lento', customer: 'Ana Oliveira', status: 'resolved', priority: 'medium', createdAt: new Date('2026-02-15') },
        { id: 5, title: 'Integração não funciona', customer: 'Carlos Mendes', status: 'in-progress', priority: 'high', createdAt: new Date('2026-02-16') },
        { id: 6, title: 'Relatório com erro', customer: 'Julia Ferreira', status: 'resolved', priority: 'medium', createdAt: new Date('2026-02-14') },
    ];

    async getAll(): Promise<Ticket[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.tickets]), 500);
        });
    }
}