import { defineStore } from "pinia";
import type { IAgendaEvent, IClosedDay } from "../../domain/entities/agenda";

interface ICalendarUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

const MOCK_USERS: ICalendarUser[] = [
  { id: 'u1', name: 'Wesley Silva', avatar: 'WS', color: '#4f46e5' },
  { id: 'u2', name: 'Ana Souza', avatar: 'AS', color: '#db2777' },
  { id: 'u3', name: 'Carlos Lima', avatar: 'CL', color: '#059669' },
  { id: 'u4', name: 'Equipe Dev', avatar: 'DV', color: '#d97706' }
];

const GUEST_USER: ICalendarUser = { id: 'guest', name: 'Convidado', avatar: 'G', color: '#94a3b8' };

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function addOneHour(time: string): string {
  if (!time) return '10:00';
  const parts = time.split(':');
  const h = Number(parts[0] || '0');
  const m = Number(parts[1] || '0');
  const date = new Date();
  date.setHours(h + 1, m);
  return date.toTimeString().substring(0, 5);
}

export const useAgendaStore = defineStore('agenda', {
  state: () => {
    const activeUser = MOCK_USERS[0] || GUEST_USER;

    return {
      allEvents: [] as IAgendaEvent[],
      closedDays: [] as IClosedDay[],
      loading: false,
      selectedDate: new Date(),
      currentUser: activeUser as ICalendarUser,
      availableUsers: MOCK_USERS,
      selectedUserIds: [activeUser.id] as string[]
    };
  },

  getters: {
    filteredEvents: (state) => {
      return state.allEvents.filter(event => {
        const currentUserId = state.currentUser?.id || 'unknown';
        const ownerId = event.userId || currentUserId;
        return state.selectedUserIds.includes(ownerId);
      });
    }
  },

  actions: {
    async fetchAgendaData() {
      this.allEvents = [];
    },

    setSelectedDate(date: Date) {
      this.selectedDate = date;
    },

    toggleUserFilter(userId: string) {
      if (this.selectedUserIds.includes(userId)) {
        this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
      } else {
        this.selectedUserIds.push(userId);
      }
    },

    addEvent(event: Partial<IAgendaEvent> & { isRecurring?: boolean }) {
      const startTime = event.time || '09:00';
      const endTime = event.endTime || addOneHour(startTime);

      const safeUser = this.currentUser || GUEST_USER;

      const baseEvent: IAgendaEvent = {
        id: generateUUID(),
        date: event.date || (new Date().toISOString().split('T')[0] ?? ''),
        time: startTime,
        endTime: endTime,
        title: event.title || 'Sem título',
        client: event.client || 'Sem cliente',

        userId: event.userId || safeUser.id,
        assigneeName: event.assigneeName || safeUser.name,
        assigneeInitials: (event.assigneeName || safeUser.name).substring(0, 2).toUpperCase(),

        colorClass: event.colorClass || 'text-blue-600',
        dotClass: event.dotClass || 'bg-blue-400',
        description: event.description || '',
        participants: event.participants || [],
        createdBy: safeUser.name,
        recurrenceType: event.recurrenceType,
        recurrenceEndDate: event.recurrenceEndDate,
        recurrenceDays: event.recurrenceDays
      };

      if (event.isRecurring && event.recurrenceType) {
        this.generateRecurringEvents(baseEvent);
      } else {
        this.allEvents.push(baseEvent);
      }
    },

    updateEvent(event: IAgendaEvent) {
      const index = this.allEvents.findIndex(e => e.id === event.id);
      if (index !== -1) this.allEvents[index] = { ...event };
    },

    deleteEvent(eventId: string) {
      this.allEvents = this.allEvents.filter(e => e.id !== eventId);
    },

    generateRecurringEvents(baseEvent: IAgendaEvent) {
      const eventsToAdd: IAgendaEvent[] = [];
      const startDate = new Date(baseEvent.date + 'T00:00:00');
      const limitDate = baseEvent.recurrenceEndDate
        ? new Date(baseEvent.recurrenceEndDate + 'T23:59:59')
        : new Date(new Date().setMonth(new Date().getMonth() + 3));

      let currentDate = new Date(startDate);
      const groupId = generateUUID();

      while (currentDate <= limitDate) {
        let shouldAdd = false;

        if (baseEvent.recurrenceType === 'daily') shouldAdd = true;
        else if (baseEvent.recurrenceType === 'monthly') {
          if (currentDate.getDate() === startDate.getDate()) shouldAdd = true;
        } else if (baseEvent.recurrenceType === 'weekly') {
          const currentDay = currentDate.getDay();
          const targetDays = baseEvent.recurrenceDays && baseEvent.recurrenceDays.length > 0
            ? baseEvent.recurrenceDays
            : [startDate.getDay()];
          if (targetDays.includes(currentDay)) shouldAdd = true;
        }

        if (shouldAdd) {
          eventsToAdd.push({
            ...baseEvent,
            id: generateUUID(),
            groupId: groupId,
            date: currentDate.toISOString().split('T')[0] ?? '',
            isRecurringInstance: true
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      this.allEvents.push(...eventsToAdd);
    }
  }
});