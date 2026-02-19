import type { Client } from "../../domain/entities/Client";
import type { IClientRepository } from "../../domain/repositories/IClientRepository";

export class InMemoryClientRepository implements IClientRepository {
    private clients: Client[] = [
        { id: 1, name: 'Fernanda Lima', company: 'Tech Solutions S.A.', email: 'fernanda@tech.com', phone: '+55 11 99999-8888', avatar: 'FL', status: 'active', source: 'whatsapp', lastInteraction: 'Há 10 min', openTickets: 2, csat: 4.8, tags: ['VIP', 'SLA Crítico'] },
        { id: 2, name: 'Roberto Carlos', company: 'Construtora RC', email: 'suporte@construtorarc.com', phone: '+55 11 98888-7777', avatar: 'RC', status: 'onboarding', source: 'email', lastInteraction: 'Ontem', openTickets: 0, csat: 5.0, tags: ['Treinamento'] },
        { id: 3, name: 'Amanda Souza', company: 'StartUp Vision', email: 'amanda@vision.com', phone: '+55 41 97777-6666', avatar: 'AS', status: 'blocked', source: 'system', lastInteraction: 'Há 3 dias', openTickets: 1, csat: 2.5, tags: ['Inadimplente', 'Risco'] },
    ];

    async getAll(): Promise<Client[]> {
        return new Promise(resolve => setTimeout(() => resolve([...this.clients]), 400));
    }
}