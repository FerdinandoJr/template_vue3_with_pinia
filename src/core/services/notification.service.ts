import { getItem, setItem, getItemSync, setItemSync } from '@/util/storage';

export interface IMockEvent {
  id: number;
  title: string;
  client: string;
  time: string;
  date: string;
  userId: string;
}

const MOCK_EVENTS: IMockEvent[] = [
  { id: 101, title: 'Reunião de Alinhamento', client: 'Empresa XYZ', time: '10:00', date: '', userId: '1' },
  { id: 102, title: 'Apresentação de Projeto', client: 'João Silva', time: '14:30', date: '', userId: '2' },
  { id: 103, title: 'Consulta de Rotina', client: 'Maria Santos', time: '09:00', date: '2022-01-01', userId: '1' }
];

export const notificationService = {
  getTodayEvents(): IMockEvent[] {
    const today = new Date().toISOString().substring(0, 10);
    return MOCK_EVENTS.map(e => ({ ...e, date: e.date || today }));
  },

  filterEventsByUser(events: IMockEvent[], userId: string | undefined, userRole: string | undefined): IMockEvent[] {
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      return events;
    }
    return events.filter(e => e.userId === userId);
  },

  getLastAlertDate(userEmail: string | undefined): string | null {
    const key = `lastNotificationDate_${userEmail || 'default'}`;
    return getItemSync(key);
  },

  setLastAlertDate(userEmail: string | undefined, date: string): void {
    const key = `lastNotificationDate_${userEmail || 'default'}`;
    setItemSync(key, date);
  },

  hasAlertForToday(userEmail: string | undefined): boolean {
    const today = new Date().toISOString().substring(0, 10);
    const lastDate = this.getLastAlertDate(userEmail);
    return lastDate === today;
  },

  markAlertAsSent(userEmail: string | undefined): void {
    const today = new Date().toISOString().substring(0, 10);
    this.setLastAlertDate(userEmail, today);
  }
};