import { defineStore } from 'pinia';
import type { IServiceItem } from '../../domain/entities/service.entity';
import { serviceServices } from '../../data/service.services';
import { ElMessage } from 'element-plus';

export interface FinishServicePayload {
  serviceId?: string | number;
  companyName?: string;
  cnpj?: string;
  duration?: string;
  reason?: string;
  description?: string;
  resolutionNotes?: string;
  status?: 'FINISHED' | 'CANCELED' | 'finished' | 'canceled';
}

export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [] as IServiceItem[],
    loading: false,
    error: null as string | null,

    currentPage: 1,
    pageSize: 10,
    filteredTotal: 0,
    filters: {} as Record<string, any>,
  }),

  getters: {
    openServices: (state) => state.services.filter(s =>
      s.status !== 'FINISHED' && s.status !== 'CANCELED' &&
      s.status !== 'finished' && s.status !== 'canceled'
    ),
  },

  actions: {
    setPage(page: number) {
      this.currentPage = page;
      this.fetchServices();
    },

    setPageSize(size: number) {
      this.pageSize = size;
      this.currentPage = 1;
      this.fetchServices();
    },

    setFilter(keyOrFilters: string | Record<string, any>, value?: any) {
      if (typeof keyOrFilters === 'string') {
        this.filters[keyOrFilters] = value;
      } else {
        this.filters = { ...this.filters, ...keyOrFilters };
      }
      this.currentPage = 1;
      this.fetchServices();
    },

    async fetchServices() {
      this.loading = true;
      this.error = null;

      try {
        const data = await serviceServices.list();
        this.services = data || [];
        this.filteredTotal = this.services.length;
      } catch (err: any) {
        this.error = err.message || 'Erro ao carregar os atendimentos.';
        ElMessage.error(this.error || 'Erro ao carregar os atendimentos.');
      } finally {
        this.loading = false;
      }
    },

    async finishService(arg1: any, arg2?: any) {
      this.loading = true;
      this.error = null;

      let payload: FinishServicePayload = {};
      let targetId: string | number | undefined;

      if (arg2 !== undefined) {
        targetId = arg1;
        payload = arg2;
      } else {
        payload = arg1;
        targetId = payload.serviceId;
      }

      try {
        if (targetId) {
          await serviceServices.update(String(targetId), { status: payload.status || 'finished' });
          await this.fetchServices();
          ElMessage.success('Atendimento finalizado!');
        }
      } catch (err: any) {
        this.error = err.message || 'Erro ao finalizar o atendimento.';
        ElMessage.error(this.error || 'Erro ao finalizar o atendimento.');
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});