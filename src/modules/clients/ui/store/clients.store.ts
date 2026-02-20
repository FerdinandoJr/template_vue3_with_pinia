import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { Client } from "../../domain/entities/Client";
import { ClientsDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useClientsStore = defineStore('clients', () => {
    const getClientsUseCase = inject(ClientsDI.GetClients)!;
    const { showToast } = useToast();

    const clients = ref<Client[]>([]);
    const loading = ref(false);
    const searchQuery = ref('');

    const loadClients = async () => {
        loading.value = true;
        try {
            clients.value = await getClientsUseCase.execute();
        } catch (error) {
            console.error(error);
            showToast("Falha ao carregar a lista de clientes.", "error");
        } finally {
            loading.value = false;
        }
    };

    const filteredClients = computed(() => {
        if (!searchQuery.value) return clients.value;
        const lower = searchQuery.value.toLowerCase();
        return clients.value.filter(c => 
            c.name.toLowerCase().includes(lower) || 
            c.company.toLowerCase().includes(lower)
        );
    });

    const getClientById = (id: number) => clients.value.find(c => c.id === id);

    const totalClients = computed(() => clients.value.length);
    const clientsWithTickets = computed(() => clients.value.filter(c => c.openTickets > 0).length);
    const criticalClients = computed(() => clients.value.filter(c => c.csat < 3).length);

    return { 
        clients, 
        loading,
        searchQuery, 
        filteredClients, 
        totalClients, 
        clientsWithTickets, 
        criticalClients, 
        loadClients,
        getClientById
    };
});