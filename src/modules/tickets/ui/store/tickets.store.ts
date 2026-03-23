import { defineStore } from "pinia";
import type { ITicket } from "../../domain/entities/Ticket";
import { ticketServices, type TicketFilter } from "../../data/ticket.services";
import { TicketStatus } from "../../domain/valueObjects/ticket-status.enum";
import { useAuthStore } from "@/modules/auth/ui/store/auth.store";

interface TicketsState {
  total: number;
  filteredTotal: number;
  items: ITicket[];
  filter: TicketFilter;
  loading: boolean;
  _fetchPromise: Promise<void> | null;
  currentPage: number;
  pageSize: number;
}

export const useTicketsStore = defineStore('tickets', {
  state: (): TicketsState => {
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      items: [],
      total: 0,
      filteredTotal: 0,
      loading: false,
      _fetchPromise: null,
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
    async fetch() {
      this.loading = true;
      this._fetchPromise = (async () => {
        try {
          const authStore = useAuthStore();
          const currentFilter = {
            ...this.filter,
            ownerId: authStore.user?.id || '1',
            page: this.currentPage,
            limit: this.pageSize
          };
          const { total, filteredTotal, items } = await ticketServices.list(currentFilter);

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
    async applyFilters(newFilters: TicketFilter) {
      this.filter = { ...this.filter, ...newFilters };
      this.currentPage = 1;
      await this.fetch();
    },
    setPage(page: number) {
      this.currentPage = page;
      this.fetch();
    },
    setPageSize(size: number) {
      this.pageSize = size;
      this.currentPage = 1;
      this.fetch();
    },
    async createTicket(data: Omit<ITicket, 'id' | 'createdAt'>) {
      await ticketServices.create(data);
      await this.fetch();
    },
    async updateTicket(id: number, data: Partial<ITicket>) {
      await ticketServices.update(id, data);
      await this.fetch();
    },
    async deleteTicket(id: number) {
      await ticketServices.delete(id);
      await this.fetch();
    }
  }
});