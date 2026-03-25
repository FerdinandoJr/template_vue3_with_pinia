import { defineStore } from 'pinia';
import type { IServiceRecord } from '../../domain/entities/service-record';

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

// Dados mocados restaurados para visualização
const MOCK_SERVICES: IServiceRecord[] = [
  {
    id: '1',
    protocol: 'PRT-20231001-01',
    customerName: 'Empresa Alpha Ltda',
    document: '12.345.678/0001-90',
    subject: 'Dúvida sobre faturamento',
    description: 'Cliente com dúvida na nota fiscal do mês passado.',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    agentId: '1',
    lastAction: 'Abertura do chamado',
    timeElapsed: '2h'
  },
  {
    id: '2',
    protocol: 'PRT-20231001-02',
    customerName: 'João da Silva',
    document: '111.222.333-44',
    subject: 'Problema no acesso',
    description: 'Não consegue logar no sistema.',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    agentId: '2',
    lastAction: 'Enviado email de reset',
    timeElapsed: '1d'
  },
  {
    id: '3',
    protocol: 'PRT-20231002-01',
    customerName: 'Tech Solutions',
    document: '98.765.432/0001-10',
    subject: 'Integração falhando',
    description: 'API retornando erro 500 no endpoint de clientes.',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    agentId: '1',
    lastAction: 'Abertura do chamado',
    timeElapsed: '1h'
  }
];

export const useServiceStore = defineStore('service', {
  state: () => ({
    services: [...MOCK_SERVICES] as IServiceRecord[], // Inicializa com os mocks
    loading: false,
    error: null as string | null,

    currentPage: 1,
    pageSize: 10,
    filteredTotal: MOCK_SERVICES.length,
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

    async fetchServices(arg1?: any, arg2?: any) {
      this.loading = true;
      this.error = null;

      try {
        // Simula um delay de requisição de rede para você ver o loading
        await new Promise(resolve => setTimeout(resolve, 300));

        // Lógica de filtro MOCADA (Para a API real isso vem do backend)
        let filtered = [...this.services];

        if (this.filters.status) {
          filtered = filtered.filter(s => s.status.toLowerCase() === this.filters.status.toLowerCase());
        }

        if (this.filters.search) {
          const term = this.filters.search.toLowerCase();
          filtered = filtered.filter(s =>
            s.customerName.toLowerCase().includes(term) ||
            s.protocol.toLowerCase().includes(term) ||
            s.subject.toLowerCase().includes(term)
          );
        }

        this.filteredTotal = filtered.length;
      } catch (err: any) {
        this.error = err.message || 'Erro ao carregar os atendimentos.';
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
          const service = this.services.find(s => s.id === targetId);
          if (service) {
            service.status = (payload.status as any) || 'finished';
            service.finishedAt = new Date().toISOString();
            this.fetchServices();
          }
        }
      } catch (err: any) {
        this.error = err.message || 'Erro ao finalizar o atendimento.';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});