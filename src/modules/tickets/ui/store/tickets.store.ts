import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ticket, TicketStatus } from "../../domain/entities/Ticket";
import { getTicketsUseCase } from "../../di";

export const useTicketsStore = defineStore('tickets', () => {
    // State
    const tickets = ref<Ticket[]>([]);
    const loading = ref(false);
    const filter = ref<TicketStatus | 'all'>('all');

    // Getters (Computed)
    const totalTickets = computed(() => tickets.value.length);
    const openTickets = computed(() => tickets.value.filter(t => t.status === 'open').length);
    const inProgressTickets = computed(() => tickets.value.filter(t => t.status === 'in-progress').length);
    const resolvedTickets = computed(() => tickets.value.filter(t => t.status === 'resolved').length);

    const filteredTickets = computed(() => {
        if (filter.value === 'all') return tickets.value;
        return tickets.value.filter(t => t.status === filter.value);
    });

    // Actions
    const setFilter = (newFilter: string) => {
        if (['all', 'open', 'in-progress', 'resolved'].includes(newFilter)) {
            filter.value = newFilter as TicketStatus | 'all';
        }
    };

    const loadTickets = async () => {
        loading.value = true;
        try {
            tickets.value = await getTicketsUseCase.execute();
        } catch (error) {
            console.error("Falha ao carregar tickets:", error);
        } finally {
            loading.value = false;
        }
    };

    return {
        tickets,
        loading,
        filter,
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        filteredTickets,
        setFilter,
        loadTickets
    };
});