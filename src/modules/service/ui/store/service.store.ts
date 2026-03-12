import { defineStore } from 'pinia';
import { serviceServices, type ServiceFilter } from '../../data/service.services';
import type { IServiceItem } from '../../domain/entities/service.entity';
import { useToast } from '@/core/composables/useToast';

interface ServiceState {
  total: number;
  filteredTotal: number;
  services: IServiceItem[];
  filter: ServiceFilter;
  loading: boolean;
  currentPage: number;
  pageSize: number;
}

export const useServiceStore = defineStore('service', {
  state: (): ServiceState => ({
    services: [],
    total: 0,
    filteredTotal: 0,
    loading: false,
    filter: {
      status: 'all',
      query: ''
    },
    currentPage: 1,
    pageSize: 10
  }),

  actions: {
    async fetchServices() {
      this.loading = true;
      try {
        this.filter.page = this.currentPage;
        this.filter.limit = this.pageSize;

        const { total, filteredTotal, items } = await serviceServices.list(this.filter);
        this.total = total;
        this.filteredTotal = filteredTotal;
        this.services = items;
      } catch (error) {
        console.error("Erro ao buscar atendimentos:", error);
      } finally {
        this.loading = false;
      }
    },

    async setPage(page: number) {
      this.currentPage = page;
      await this.fetchServices();
    },

    async setPageSize(size: number) {
      this.pageSize = size;
      this.currentPage = 1;
      await this.fetchServices();
    },

    async setFilter(filters: Partial<ServiceFilter>) {
      this.filter = { ...this.filter, ...filters };
      this.currentPage = 1;
      await this.fetchServices();
    },

    async finishService(id: string, resolutionDetails: string) {
      const { showToast } = useToast();
      this.loading = true;
      try {
        await serviceServices.updateStatus(id, 'finished', resolutionDetails);
        showToast("Atendimento finalizado com sucesso!", "success");
        await this.fetchServices();
      } catch (error) {
        showToast("Erro ao finalizar atendimento.", "error");
      } finally {
        this.loading = false;
      }
    }
  }
});