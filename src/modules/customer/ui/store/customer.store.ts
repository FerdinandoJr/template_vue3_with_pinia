import { defineStore } from "pinia"
import { customerServices, type CustomerFilter } from "../../data/customer.services"
import type { ICustomer } from "../../domain/entities/customer"
import { useToast } from "@/core/composables/useToast"

interface CustomerState {
    total: number
    filteredTotal: number
    items: ICustomer[]
    filter: CustomerFilter
    loading: boolean
    currentPage: number
    pageSize: number
}

export const useCustomerStore = defineStore('customer', {
    state: (): CustomerState => ({
        items: [],
        total: 0,
        filteredTotal: 0,
        loading: false,
        filter: {},
        currentPage: 1,
        pageSize: 10
    }),

    actions: {
        async fetch() {
            this.loading = true
            try {
                this.filter.page = this.currentPage;
                this.filter.limit = this.pageSize;

                const { total, filteredTotal, items } = await customerServices.list(this.filter)
                this.total = total
                this.filteredTotal = filteredTotal
                this.items = items
            } catch (error) {
                console.error(error)
            } finally {
                this.loading = false
            }
        },

        async setPage(page: number) {
            this.currentPage = page;
            await this.fetch();
        },

        async setPageSize(size: number) {
            this.pageSize = size;
            this.currentPage = 1;
            await this.fetch();
        },

        async setQuery(query: string) {
            this.filter.query = query;
            this.currentPage = 1;
            await this.fetch();
        },

        async fetchById(uuid: string): Promise<ICustomer | undefined> {
            this.loading = true;
            try {
                return await customerServices.getById(uuid);
            } catch (error) {
                console.error("Erro ao buscar cliente:", error);
                return undefined;
            } finally {
                this.loading = false;
            }
        },

        async createCustomer(data: Omit<ICustomer, 'uuid' | 'lastInteraction' | 'openTickets' | 'csat'>): Promise<ICustomer | undefined> {
            const { showToast } = useToast();
            this.loading = true;
            try {
                const newCustomer = await customerServices.create(data);
                showToast("Cliente cadastrado com sucesso!", "success");
                await this.fetch();
                return newCustomer;
            } catch (error) {
                showToast("Erro ao cadastrar cliente.", "error");
                return undefined;
            } finally {
                this.loading = false;
            }
        },

        async updateCustomer(uuid: string, data: Partial<ICustomer>) {
            const { showToast } = useToast();
            this.loading = true;
            try {
                await customerServices.update(uuid, data);
                showToast("Cliente atualizado com sucesso!", "success");
                await this.fetch();
            } catch (error) {
                showToast("Erro ao atualizar cliente.", "error");
            } finally {
                this.loading = false;
            }
        },

        async deleteCustomer(uuid: string) {
            const { showToast } = useToast();
            this.loading = true;
            try {
                await customerServices.delete(uuid);
                showToast("Cliente excluído com sucesso!", "success");
                await this.fetch();
            } catch (error) {
                showToast("Erro ao excluir cliente.", "error");
            } finally {
                this.loading = false;
            }
        }
    }
})