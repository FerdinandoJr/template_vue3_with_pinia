import { getItem, setItem, getItemSync, setItemSync } from '@/util/storage';

export interface IEvent {
  id: string;
  title: string;
  client: string;
  time: string;
  date: string;
  userId: string;
}

export const notificationService = {
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
  },

  async getTodayEvents(): Promise<IEvent[]> {
    return [];
  },

  filterEventsByUser(events: IEvent[], userId?: string, role?: string): IEvent[] {
    if (!events || events.length === 0) return [];
    if (role === 'ADMIN' || role === 'MANAGER') return events;
    return events.filter(e => e.userId === userId);
  }
};