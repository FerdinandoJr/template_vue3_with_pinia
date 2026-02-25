import { defineStore } from "pinia";
import type { ITicket } from "../../domain/entities/ticket";
import { ticketServices, type TicketFilter } from "../../data/ticket.services";
import { TicketStatus } from "../../domain/valueObjects/ticket-status.enum";

interface TicketsState {
  total: number;
  filteredTotal: number;
  items: ITicket[];
  filter: TicketFilter;
  loading: boolean;
  _fetchPromise: Promise<void> | null;
}

export const useTicketsStore = defineStore('tickets', {
  state: (): TicketsState => ({
    items: [],
    total: 0,
    filteredTotal: 0,
    loading: false,
    _fetchPromise: null,
    filter: { status: 'all' }
  }),
  getters: {
    openTickets: (state) => state.items.filter(t => t.status === TicketStatus.OPEN).length,
    inProgressTickets: (state) => state.items.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
    resolvedTickets: (state) => state.items.filter(t => t.status === TicketStatus.RESOLVED).length,
  },
  actions: {
    async fetch() {
      this.loading = true;

      this._fetchPromise = (async () => {
        try {
          const { total, filteredTotal, items } = await ticketServices.list(this.filter);
          this.total = total;
          this.filteredTotal = filteredTotal;
          this.items = items;
        } catch (error) {
          console.error(error);
        } finally {
          this.loading = false;
        }
      })();

      return this._fetchPromise;
    },
    
    async setFilterStatus(status: TicketStatus | 'all') {
      this.filter.status = status;
      await this.fetch();
    }
  }
});