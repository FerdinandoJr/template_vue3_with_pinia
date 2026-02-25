import { defineStore } from "pinia";
import type { IAgendaEvent, IClosedDay } from "../../domain/entities/agenda";
import { agendaServices } from "../../data/agenda.services";

export const useAgendaStore = defineStore('agenda', {
  state: () => ({
    events: [] as IAgendaEvent[],
    closedDays: [] as IClosedDay[],
    loading: false
  }),
  actions: {
    async fetchAgendaData() {
      this.loading = true;
      try {
        const [eventsData, closedData] = await Promise.all([
          agendaServices.getEvents(),
          agendaServices.getClosedDays()
        ]);
        this.events = eventsData;
        this.closedDays = closedData;
      } finally {
        this.loading = false;
      }
    }
  }
});