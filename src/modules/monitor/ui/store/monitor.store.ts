import { defineStore } from "pinia";
import { useChatStore } from "@/modules/chats/ui/store/chat.store";

interface AgentGroup {
    agentId: string;
    agentName: string;
    ongoing: any[];
    completed: any[];
}

const teamMembers = [
    { id: '1', name: 'Admin (Você)' },
    { id: '2', name: 'João Atendimento' },
    { id: '3', name: 'Maria Vendas' }
];

export const useMonitorStore = defineStore('monitor', {
    state: () => ({
        searchQuery: '',
        selectedAgents: [] as string[],
        loading: false
    }),
    getters: {
        teamMembersList(): typeof teamMembers {
            return teamMembers;
        },
        groupedByAgent(state): AgentGroup[] {
            const chatStore = useChatStore();
            const groups: Record<string, AgentGroup> = {};

            groups['0'] = {
                agentId: '0',
                agentName: 'Fila de Espera',
                ongoing: [],
                completed: []
            };

            teamMembers.forEach(member => {
                groups[member.id] = {
                    agentId: member.id,
                    agentName: member.name,
                    ongoing: [],
                    completed: []
                };
            });

            const term = state.searchQuery.toLowerCase();

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

            if (state.selectedAgents.length > 0) {
                result = result.filter(group => state.selectedAgents.includes(group.agentId));
            }

            return result.sort((a, b) => {
                if (a.agentId === '0') return -1;
                if (b.agentId === '0') return 1;
                return Number(a.agentId) - Number(b.agentId);
            });
        }
    }
});