import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useChatStore } from "@/modules/chats/ui/store/chat.store";
import { monitorServices } from "../../data/monitor.services";

interface AgentGroup {
    agentId: string;
    agentName: string;
    ongoing: any[];
    completed: any[];
}

export const useMonitorStore = defineStore('monitor', () => {
    const searchQuery = ref('');
    const selectedAgents = ref<string[]>([]);
    const loading = ref(false);
    const dashboardData = ref<any>(null);
    const healthData = ref<any>(null);

    const teamMembersList = computed(() => {
        if (dashboardData.value?.agents) {
            return dashboardData.value.agents;
        }
        return [];
    });

    const groupedByAgent = computed((): AgentGroup[] => {
        const chatStore = useChatStore();
        const groups: Record<string, AgentGroup> = {};

        groups['0'] = {
            agentId: '0',
            agentName: 'Fila de Espera',
            ongoing: [],
            completed: []
        };

        teamMembersList.value.forEach((member: any) => {
            groups[member.id] = {
                agentId: member.id,
                agentName: member.name,
                ongoing: [],
                completed: []
            };
        });

        const term = searchQuery.value.toLowerCase();

        if (chatStore.contacts && Array.isArray(chatStore.contacts)) {
            chatStore.contacts.forEach(contact => {
                const customerName = contact.company || contact.name || 'Desconhecido';

                let rawAgentId = contact.agentId ? String(contact.agentId) : '0';
                const agentId = rawAgentId.replace('agent_', '');

                if (!groups[agentId]) {
                    groups[agentId] = {
                        agentId: agentId,
                        agentName: `Atendente ${agentId}`,
                        ongoing: [],
                        completed: []
                    };
                }

                const group = groups[agentId];

                if (term && !customerName.toLowerCase().includes(term) && !group.agentName.toLowerCase().includes(term)) {
                    return;
                }

                if (contact.status === 'finished') {
                    group.completed.push(contact);
                } else {
                    group.ongoing.push(contact);
                }
            });
        }

        let result = Object.values(groups);

        if (selectedAgents.value.length > 0) {
            result = result.filter((group: any) => selectedAgents.value.includes(group.agentId));
        }

        return result.sort((a: any, b: any) => {
            if (a.agentId === '0') return -1;
            if (b.agentId === '0') return 1;
            return Number(a.agentId) - Number(b.agentId);
        });
    });

    async function fetchDashboard() {
        loading.value = true;
        try {
            dashboardData.value = await monitorServices.getDashboard();
            await fetchChats();
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            await fetchChats();
        } finally {
            loading.value = false;
        }
    }

    async function fetchChats() {
        const chatStore = useChatStore();
        try {
            await chatStore.fetchChats();
        } catch (error) {
            console.error('Erro ao carregar chats:', error);
        }
    }

    async function fetchHealth() {
        try {
            healthData.value = await monitorServices.getHealth();
        } catch (error) {
            console.error('Erro ao carregar health:', error);
        }
    }

    function setSearchQuery(query: string) {
        searchQuery.value = query;
    }

    function setSelectedAgents(agents: string[]) {
        selectedAgents.value = agents;
    }

    return {
        searchQuery,
        selectedAgents,
        loading,
        dashboardData,
        healthData,
        teamMembersList,
        groupedByAgent,
        fetchDashboard,
        fetchHealth,
        setSearchQuery,
        setSelectedAgents,
    };
});