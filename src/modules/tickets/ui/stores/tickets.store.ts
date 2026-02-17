import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useTicketsStore = defineStore('tickets', () => {
    // State
    const tickets = ref<any[]>([])
    const loading = ref(false)
    const filter = ref('all') // 'all', 'open', 'in-progress', 'resolved'

    // Getters
    const totalTickets = computed(() => tickets.value.length)
    const openTickets = computed(() => tickets.value.filter(t => t.status === 'open').length)
    const inProgressTickets = computed(() => tickets.value.filter(t => t.status === 'in-progress').length)
    const resolvedTickets = computed(() => tickets.value.filter(t => t.status === 'resolved').length)

    const filteredTickets = computed(() => {
        if (filter.value === 'all') return tickets.value
        return tickets.value.filter(t => t.status === filter.value)
    })

    // Actions
    const setFilter = (newFilter: string) => {
        filter.value = newFilter
    }

    const loadTickets = async () => {
        loading.value = true
        // Simular dados mocados por enquanto
        tickets.value = [
            { id: 1, title: 'Problema com login', customer: 'João Silva', status: 'open', priority: 'high', created: '2026-02-17' },
            { id: 2, title: 'Erro ao processar pagamento', customer: 'Maria Santos', status: 'in-progress', priority: 'urgent', created: '2026-02-17' },
            { id: 3, title: 'Dúvida sobre funcionalidade', customer: 'Pedro Costa', status: 'open', priority: 'low', created: '2026-02-16' },
            { id: 4, title: 'Sistema lento', customer: 'Ana Oliveira', status: 'resolved', priority: 'medium', created: '2026-02-15' },
            { id: 5, title: 'Integração não funciona', customer: 'Carlos Mendes', status: 'in-progress', priority: 'high', created: '2026-02-16' },
            { id: 6, title: 'Relatório com erro', customer: 'Julia Ferreira', status: 'resolved', priority: 'medium', created: '2026-02-14' },
        ]
        loading.value = false
    }

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
    }
})

export default useTicketsStore
