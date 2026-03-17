import { defineStore } from 'pinia';

export interface CustomerSource {
    id: string;
    name: string;
}

export const useCustomerSourceStore = defineStore('customerSource', {
    state: () => ({
        items: [] as CustomerSource[],
        isLoading: false,
        hasLoaded: false, // Evita buscar no banco repetidas vezes sem necessidade
    }),

    actions: {
        // Busca os dados (Pronto para conectar ao banco de dados)
        async fetchSources() {
            if (this.hasLoaded) return; // Se já carregou, não faz nova requisição

            this.isLoading = true;
            try {
                // SIMULAÇÃO DE CHAMADA A API (Substitua por axios.get futuramente)
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

        // Adiciona uma nova origem
        async addSource(name: string) {
            if (!name.trim()) return;

            try {
                // SIMULAÇÃO DE POST NA API (Substitua por axios.post futuramente)
                const newSource: CustomerSource = {
                    id: Date.now().toString(), // ID temporário até ter o do banco
                    name: name.trim()
                };

                this.items.push(newSource);
                return true;
            } catch (error) {
                console.error('Erro ao adicionar origem:', error);
                return false;
            }
        },

        // Atualiza uma origem existente
        async updateSource(id: string, newName: string) {
            if (!newName.trim()) return;

            try {
                // SIMULAÇÃO DE PUT/PATCH NA API
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

        // Remove uma origem
        async deleteSource(id: string) {
            try {
                // SIMULAÇÃO DE DELETE NA API
                this.items = this.items.filter(s => s.id !== id);
                return true;
            } catch (error) {
                console.error('Erro ao deletar origem:', error);
                return false;
            }
        }
    }
});