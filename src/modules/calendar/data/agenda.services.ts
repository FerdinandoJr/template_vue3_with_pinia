import type { IAgendaEvent, IClosedDay } from "../domain/entities/agenda";

const mockEvents: IAgendaEvent[] = [
  {
    id: '1', date: '2026-03-05', time: '09:00', title: 'Reunião de Alinhamento',
    client: 'Tech Solutions', assigneeInitials: 'AS', assigneeName: 'ANA SILVA',
    colorClass: 'text-emerald-700', dotClass: 'bg-emerald-400'
  },
  {
    id: '2', date: '2026-03-10', time: '10:00', title: 'Treinamento Equipe',
    client: 'Advocacia Silva', assigneeInitials: 'AS', assigneeName: 'ANA SILVA',
    colorClass: 'text-emerald-700', dotClass: 'bg-emerald-400'
  },
  {
    id: '3', date: '2026-03-12', time: '11:00', title: 'Suporte Remoto',
    client: 'Consultório Dr. João', assigneeInitials: 'AS', assigneeName: 'ANA SILVA',
    colorClass: 'text-emerald-700', dotClass: 'bg-emerald-400'
  },
  {
    id: '4', date: '2026-03-14', time: '14:30', title: 'Instalação de Certificado',
    client: 'Padaria Central', assigneeInitials: 'CM', assigneeName: 'CARLOS MENDES',
    colorClass: 'text-amber-600', dotClass: 'bg-amber-400'
  }
];

const mockClosedDays: IClosedDay[] = [
  { date: '2026-03-01' },
  { date: '2026-03-08' },
  { date: '2026-03-15' }
];

export const agendaServices = {
  async getEvents(): Promise<IAgendaEvent[]> {
    return new Promise(res => setTimeout(() => res(mockEvents), 200));
  },
  async getClosedDays(): Promise<IClosedDay[]> {
    return new Promise(res => setTimeout(() => res(mockClosedDays), 200));
  }
};