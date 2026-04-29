import { defineStore } from "pinia";
import { serviceRecordsService, type IServiceRecord } from "../../data/service-records.service";

interface ServiceRecordsState {
  items: IServiceRecord[];
  total: number;
  loading: boolean;
  currentPage: number;
  pageSize: number;
  filter: {
    status?: string;
    search?: string;
    attendantId?: string;
  };
}

export const useServiceRecordsStore = defineStore('service_records', {
  state: (): ServiceRecordsState => ({
    items: [],
    total: 0,
    loading: false,
    currentPage: 1,
    pageSize: 20,
    filter: {
      status: undefined,
      search: undefined,
      attendantId: undefined
    }
  }),
  getters: {
    openCount: (state) => state.items.filter(a => a.status === 'open').length,
    inProgressCount: (state) => state.items.filter(a => a.status === 'in_progress').length,
    resolvedCount: (state) => state.items.filter(a => a.status === 'resolved').length,
    closedCount: (state) => state.items.filter(a => a.status === 'closed').length,
  },
  actions: {
    async fetch() {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const { items, total } = await serviceRecordsService.list({
          page: this.currentPage,
          limit: this.pageSize,
          ...this.filter
        });
        this.items = items;
        this.total = total;
      } catch (error) {
        console.error(error);
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    async applyFilters(filters: Partial<ServiceRecordsState['filter']>) {
      this.filter = { ...this.filter, ...filters };
      this.currentPage = 1;
      await this.fetch();
    },
    async setPage(page: number) {
      this.currentPage = page;
      await this.fetch();
    },
    async create(data: Partial<IServiceRecord>): Promise<IServiceRecord | undefined> {
      const created = await serviceRecordsService.create(data);
      await this.fetch();
      return created;
    },
    async update(id: string, data: Partial<IServiceRecord>) {
      const updated = await serviceRecordsService.update(id, data);
      const index = this.items.findIndex(a => a.id === id);
      if (index !== -1) {
        this.items[index] = { ...this.items[index], ...data, ...updated };
      }
    },
    async delete(id: string) {
      await serviceRecordsService.delete(id);
      await this.fetch();
    }
  }
});