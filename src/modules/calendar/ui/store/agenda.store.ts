import { defineStore } from "pinia";
import type { IAgendaEvent, IClosedDay } from "../../domain/entities/agenda";
import { AgendaDomainService } from "../../domain/services/agenda.domain.service";
import { generateUUIDv7 } from "@/util/helpers";
import { useAuthStore } from "@/modules/auth/ui/store/auth.store";

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

export const useAgendaStore = defineStore('agenda', {
  state: () => {
    return {
      allEvents: [] as IAgendaEvent[],
      closedDays: [] as IClosedDay[],
      loading: false,
      selectedDate: new Date(),
      availableUsers: MOCK_USERS,
      selectedUserIds: [] as string[]
    };
  },
  getters: {
    currentUser(): ICalendarUser {
      const authStore = useAuthStore();
      if (authStore.user) {
        return {
          id: authStore.user.id || 'u1',
          name: authStore.user.name,
          avatar: authStore.user.name.substring(0, 2).toUpperCase(),
          color: '#4f46e5'
        };
      }
      return GUEST_USER;
    },

    filteredEvents(state): IAgendaEvent[] {
      const activeIds = state.selectedUserIds.length > 0
        ? state.selectedUserIds
        : [this.currentUser.id];

      return state.allEvents.filter((event) => {
        const ownerId = event.userId || this.currentUser.id;
        return activeIds.includes(ownerId);
      });
    }
  },
  actions: {
    async fetchAgendaData() {
      this.allEvents = [];
      if (this.selectedUserIds.length === 0 && this.currentUser.id !== 'guest') {
        this.selectedUserIds.push(this.currentUser.id);
      }
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
      const endTime = event.endTime || AgendaDomainService.addOneHour(startTime);
      const safeUser = this.currentUser || GUEST_USER;

      const baseEvent: IAgendaEvent = {
        id: generateUUIDv7(),
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
        const recurringEvents = AgendaDomainService.generateRecurringEvents(baseEvent);
        this.allEvents.push(...recurringEvents);
      } else {
        this.allEvents.push(baseEvent);
      }
    },
    updateEvent(event: IAgendaEvent) {
      const index = this.allEvents.findIndex(e => e.id === event.id);
      if (index !== -1) {
        this.allEvents[index] = { ...event };
      }
    },
    deleteEvent(eventId: string) {
      this.allEvents = this.allEvents.filter(e => e.id !== eventId);
    }
  }
});
