import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Client } from "../../domain/entities/Client";
import { getClientsUseCase } from "../../di";

export const useClientsStore = defineStore('clients', () => {
    const clients = ref<Client[]>([]);
    const loading = ref(false);
    const searchQuery = ref('');
    const selectedClientId = ref<number | null>(null);
    const isDrawerOpen = ref(false);
    const selectedTab = ref('historico'); 

    const loadClients = async () => {
        loading.value = true;
        try {
            clients.value = await getClientsUseCase.execute();
        } finally {
            loading.value = false;
        }
    };

    const openClientDrawer = (id: number) => { 
        selectedClientId.value = id; 
        isDrawerOpen.value = true; 
    };

    const closeDrawer = () => { 
        isDrawerOpen.value = false; 
        setTimeout(() => selectedClientId.value = null, 300); 
    };

    const filteredClients = computed(() => {
        if (!searchQuery.value) return clients.value;
        const lower = searchQuery.value.toLowerCase();
        return clients.value.filter(c => 
            c.name.toLowerCase().includes(lower) || 
            c.company.toLowerCase().includes(lower)
        );
    });

    const activeClient = computed(() => clients.value.find(c => c.id === selectedClientId.value));

    const totalClients = computed(() => clients.value.length);
    const clientsWithTickets = computed(() => clients.value.filter(c => c.openTickets > 0).length);
    const criticalClients = computed(() => clients.value.filter(c => c.csat < 3).length);

    return { 
        clients, 
        loading,
        searchQuery, 
        filteredClients, 
        activeClient, 
        isDrawerOpen, 
        selectedTab, 
        totalClients, 
        clientsWithTickets, 
        criticalClients, 
        loadClients,
        openClientDrawer, 
        closeDrawer 
    };
});