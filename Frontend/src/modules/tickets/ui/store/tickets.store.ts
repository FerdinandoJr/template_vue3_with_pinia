import { defineStore } from "pinia";
import type { ITicket } from "../../domain/entities/Ticket";
import { ticketServices, type TicketFilter, type Paginated } from "../../data/ticket.services";
import { TicketStatus } from "../../domain/valueObjects/ticket-status.enum";
import { useAuthStore } from "@/modules/auth/ui/store/auth.store";

interface TicketsState {
  items: ITicket[];
  total: number;
  filteredTotal: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  filter: TicketFilter;
}

interface TicketStats {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  avgResolutionTime: number;
  firstResponseRate: number;
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
      error: null,
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
    hasError: (state) => !!state.error,
    currentItems: (state) => state.items,
    
    getTicketsByStatus: (state) => (status: string) => {
      return state.items.filter(t => t.status === status);
    },
    
    getTicketById: (state) => (id: string) => {
      return state.items.find(t => t.id === id);
    },
  },

  actions: {
    async _executeFetch(): Promise<void> {
      if (this.loading) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const status = this.filter.status === 'all' ? undefined : this.filter.status;
        const authStore = useAuthStore();
        
        const currentFilter: TicketFilter = {
          status,
          query: this.filter.query || undefined,
          page: this.currentPage,
          pageSize: this.pageSize,
          ownerOnly: this.filter.ownerOnly,
          assignees: (this.filter.assignees && this.filter.assignees.length > 0) ? this.filter.assignees : undefined,
          customers: (this.filter.customers && this.filter.customers.length > 0) ? this.filter.customers : undefined,
          dateRange: this.filter.dateRange || undefined,
          userId: this.filter.ownerOnly ? authStore.user?.id : undefined,
        };
        
        console.log('[TicketsStore] Fetching with filter:', JSON.stringify(currentFilter));
        
        const result: Paginated<ITicket> = await ticketServices.list(currentFilter);
        
        console.log('[TicketsStore] Result:', result?.total, 'tickets');
        
        this.total = result.total;
        this.filteredTotal = result.filteredTotal;
        this.items = result.items;
      } catch (error: any) {
        console.error('[TicketsStore] Fetch error:', error);
        this.error = error?.message || 'Erro ao carregar tickets';
        this.items = [];
      } finally {
        this.loading = false;
      }
    },

    async fetch(): Promise<void> {
      await this._executeFetch();
    },

    async fetchById(id: string): Promise<ITicket | null> {
      try {
        return await ticketServices.getById(id);
      } catch (error: any) {
        console.error('[TicketsStore] Fetch by ID error:', error);
        return null;
      }
    },

    async applyFilters(newFilters: TicketFilter): Promise<void> {
      const status = newFilters.status === 'all' ? undefined : newFilters.status;
      this.filter = { ...this.filter, ...newFilters, status };
      this.currentPage = 1;
      await this._executeFetch();
    },

    async setPage(page: number): Promise<void> {
      this.currentPage = page;
      await this._executeFetch();
    },

    async setPageSize(size: number): Promise<void> {
      this.pageSize = size;
      this.currentPage = 1;
      await this._executeFetch();
    },

    async createTicket(data: any): Promise<ITicket | undefined> {
      this.loading = true;
      this.error = null;
      
      try {
        const created = await ticketServices.create(data);
        if (created) {
          this.items = [created, ...this.items];
          this.total += 1;
          this.filteredTotal += 1;
        }
        return created;
      } catch (error: any) {
        console.error('[TicketsStore] Create error:', error);
        this.error = error?.message || 'Erro ao criar ticket';
        return undefined;
      } finally {
        this.loading = false;
      }
    },

    async updateTicket(id: string, data: Partial<ITicket>): Promise<ITicket | undefined> {
      if (!id || typeof id !== 'string') {
        console.error('[TicketsStore] ID inválido para update:', id);
        return undefined;
      }
      
      this.loading = true;
      this.error = null;
      
      const previousItems = [...this.items];
      const index = this.items.findIndex(t => t.id === id);
      
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...data };
      }
      
      try {
        const updatedTicket = await ticketServices.update(id, data);
        if (updatedTicket) {
          const idx = this.items.findIndex(t => t.id === id);
          if (idx !== -1) {
            this.items[idx] = { ...this.items[idx], ...updatedTicket };
          }
        }
        return updatedTicket;
      } catch (error: any) {
        console.error('[TicketsStore] Update error:', error);
        this.items = previousItems;
        this.error = error?.message || 'Erro ao atualizar ticket';
        return undefined;
      } finally {
        this.loading = false;
      }
    },

    async deleteTicket(id: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      const previousItems = [...this.items];
      this.items = this.items.filter(t => t.id !== id);
      
      try {
        await ticketServices.delete(id);
        this.total -= 1;
        this.filteredTotal -= 1;
        return true;
      } catch (error: any) {
        console.error('[TicketsStore] Delete error:', error);
        this.items = previousItems;
        this.error = error?.message || 'Erro ao excluir ticket';
        return false;
      } finally {
        this.loading = false;
      }
    },

    clearError(): void {
      this.error = null;
    },

    reset(): void {
      const [startOfMonth, endOfMonth] = getDefaultDateRange();
      this.items = [];
      this.total = 0;
      this.filteredTotal = 0;
      this.loading = false;
      this.error = null;
      this.currentPage = 1;
      this.pageSize = 10;
      this.filter = {
        status: 'all',
        query: '',
        customers: [],
        dateRange: [startOfMonth, endOfMonth],
        ownerOnly: true,
        assignees: []
      };
    }
  }
});