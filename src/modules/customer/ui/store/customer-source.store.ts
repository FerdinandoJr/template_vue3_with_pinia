import { defineStore } from 'pinia';

export interface CustomerSource {
    id: string;
    name: string;
}

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
                await new Promise(resolve => setTimeout(resolve, 600));

                this.items = [
                    { id: '1', name: 'WhatsApp' },
                    { id: '2', name: 'Site / Landing Page' },
                    { id: '3', name: 'Indicação' },
                    { id: '4', name: 'Instagram' },
                    { id: '5', name: 'Outro' }
                ];

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
                const newSource: CustomerSource = {
                    id: Date.now().toString(),
                    name: name.trim()
                };

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
                const source = this.items.find(s => s.id === id);
                if (source) {
                    source.name = newName.trim();
                }
                return true;
            } catch (error) {
                console.error('Erro ao atualizar origem:', error);
                return false;
            }
        },

        async deleteSource(id: string) {
            try {
                this.items = this.items.filter(s => s.id !== id);
                return true;
            } catch (error) {
                console.error('Erro ao deletar origem:', error);
                return false;
            }
        }
    }
});