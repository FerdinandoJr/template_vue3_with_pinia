import { defineStore } from "pinia";
import type { IServiceRecord } from "../../domain/entities/service-record";
import { serviceDeskServices, type ServiceFilter } from "../../data/service.services";
import { ServiceStatus } from "../../domain/valueObjects/service-status.enum";
import { useToast } from "@/core/composables/useToast";

export interface FinishServicePayload {
  companyName: string;
  cnpj: string;
  reason: string;
  description: string;
  duration: string;
}

interface ServiceState {
  total: number;
  filteredTotal: number;
  items: IServiceRecord[];
  filter: ServiceFilter;
  loading: boolean;
  _fetchPromise: Promise<void> | null;
}

export const useServiceStore = defineStore("service", {
  state: (): ServiceState => ({
    items: [],
    total: 0,
    filteredTotal: 0,
    loading: false,
    _fetchPromise: null,
    filter: { query: "" }
  }),
  actions: {
    async fetch() {
      this.loading = true;
      this._fetchPromise = (async () => {
        try {
          const { total, filteredTotal, items } = await serviceDeskServices.list(this.filter);
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

    async setQuery(query: string) {
      this.filter.query = query;
      await this.fetch();
    },

    async registerFinish(data: FinishServicePayload) {
      const { showToast } = useToast();
      this.loading = true;
      try {
        await serviceDeskServices.create({
          ...data,
          agentName: "Usuário Logado",
          status: ServiceStatus.ACTIVE,
        });
        showToast("Atendimento finalizado com sucesso!", "success");
        await this.fetch();
      } catch (error) {
        showToast("Erro ao registrar a finalização do atendimento.", "error");
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  }
});