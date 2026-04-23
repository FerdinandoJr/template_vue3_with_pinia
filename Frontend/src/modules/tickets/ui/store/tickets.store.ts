import { defineStore } from "pinia";
import type { ITicket } from "../../domain/entities/Ticket";
import { ticketServices, type TicketFilter } from "../../data/ticket.services";
import { TicketStatus } from "../../domain/valueObjects/ticket-status.enum";

interface TicketsState {
  total: number;
  filteredTotal: number;
  items: ITicket[];
  filter: TicketFilter;
  loading: boolean;
  currentPage: number;
  pageSize: number;
}

function getDefaultDateRange(): [Date, Date] {
  const date = new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [startOfMonth, endOfMonth];
}

export const useTicketsStore = defineStore('tickets', {
  state: (): TicketsState => {
    const [startOfMonth, endOfMonth] = getDefaultDateRange();

    return {
      items: [],
      total: 0,
      filteredTotal: 0,
      loading: false,
      currentPage: 1,
      pageSize: 10,
      filter: {
        status: 'all',
        query: '',
        customers: [],
        dateRange: [startOfMonth, endOfMonth],
        ownerOnly: true,
        assignees: []
      }
    };
  },
  getters: {
    openTickets: (state) => state.items.filter(t => t.status === TicketStatus.OPEN).length,
    inProgressTickets: (state) => state.items.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
    resolvedTickets: (state) => state.items.filter(t => t.status === TicketStatus.RESOLVED).length,
  },
  actions: {
    async _executeFetch(): Promise<void> {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const status = this.filter.status === 'all' ? undefined : this.filter.status;
        const currentFilter = {
          status,
          query: this.filter.query,
          page: this.currentPage,
          pageSize: this.pageSize,
          ownerOnly: this.filter.ownerOnly,
          assignees: this.filter.assignees,
          customers: this.filter.customers,
        };
        const { total, filteredTotal, items } = await ticketServices.list(currentFilter);
        this.total = total;
        this.filteredTotal = filteredTotal;
        this.items = items;
      } catch (error) {
        console.error(error);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    async fetch() {
      await this._executeFetch();
    },
    async applyFilters(newFilters: TicketFilter) {
      const status = newFilters.status === 'all' ? undefined : newFilters.status;
      this.filter = { ...this.filter, ...newFilters, status };
      this.currentPage = 1;
      await this._executeFetch();
    },
    async setPage(page: number) {
      this.currentPage = page;
      await this._executeFetch();
    },
    async setPageSize(size: number) {
      this.pageSize = size;
      this.currentPage = 1;
      await this._executeFetch();
    },
    async createTicket(data: Omit<ITicket, 'id' | 'createdAt'>) {
      await ticketServices.create(data);
      await this._executeFetch();
    },
    async updateTicket(id: number, data: Partial<ITicket>) {
      const updatedTicket = await ticketServices.update(String(id), data);
      const index = this.items.findIndex(t => t.id === id);
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...data, ...updatedTicket };
      }
    },
    async deleteTicket(id: number) {
      await ticketServices.delete(String(id));
      await this._executeFetch();
    }
  }
});