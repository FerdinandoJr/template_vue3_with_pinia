import { defineStore } from 'pinia';
import { customerSourceServices, type CustomerSource } from '../../data/customer-source.services';

export const useCustomerSourceStore = defineStore('customerSource', {
    state: () => ({
        items: [] as CustomerSource[],
        isLoading: false,
        hasLoaded: false,
    }),

    actions: {
        async fetchSources() {
            if (this.hasLoaded) return;

            this.isLoading = true;
            try {
                this.items = await customerSourceServices.list();
                this.hasLoaded = true;
            } catch (error) {
                console.error('Erro ao buscar as origens de clientes:', error);
            } finally {
                this.isLoading = false;
            }
        },

        async addSource(name: string) {
            if (!name.trim()) return;

            try {
                const newSource = await customerSourceServices.create(name.trim());
                this.items.push(newSource);
                return true;
            } catch (error) {
                console.error('Erro ao adicionar origem:', error);
                return false;
            }
        },

        async updateSource(id: string, newName: string) {
            if (!newName.trim()) return;

            try {
                const updated = await customerSourceServices.update(id, newName.trim());
                const index = this.items.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.items[index] = updated;
                }
                return true;
            } catch (error) {
                console.error('Erro ao atualizar origem:', error);
                return false;
            }
        },

        async deleteSource(id: string) {
            try {
                await customerSourceServices.delete(id);
                this.items = this.items.filter(s => s.id !== id);
                return true;
            } catch (error) {
                console.error('Erro ao deletar origem:', error);
                return false;
            }
        }
    }
});