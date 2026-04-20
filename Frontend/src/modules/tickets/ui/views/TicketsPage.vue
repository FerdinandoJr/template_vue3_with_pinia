<template>
  <div class="p-6 h-[calc(100vh-4rem)] flex flex-col bg-[#f8fafd] overflow-hidden">
    <div class="mb-6 flex flex-col md:flex-row justify-between md:items-center shrink-0 gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-800">Tickets de Suporte</h2>
        <p class="text-slate-500 text-sm font-medium mt-1">Gerencie e priorize o atendimento aos clientes</p>
      </div>
      <div class="flex items-center gap-4">
        <el-button type="primary" size="large" class="!font-bold !rounded-lg shadow-sm" @click="openModal()">
          <el-icon class="mr-2">
            <Plus />
          </el-icon> Novo Ticket
        </el-button>
      </div>
    </div>

    <TicketStats :total="store.total" :open="openTickets" :in-progress="inProgressTickets" :resolved="resolvedTickets" />
    <TicketFilters :filters="currentFilters" @update:filters="handleFilter" class="shrink-0" />

    <div class="flex-1 min-h-0 relative">
      <TicketTable :tickets="store.items" @view="openModal" @edit="openModal" />
    </div>

    <TicketModal :is-open="isModalOpen" :ticket="selectedTicket" :initial-data="selectedTicket || {}" @close="closeModal" @save="saveTicket" @approve-kanban="handleApproveKanban" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TicketStats from '../components/TicketStats.vue';
import TicketFilters from '../components/TicketFilters.vue';
import TicketTable from '../components/TicketTable.vue';
import TicketModal from '../components/TicketModal.vue';
import { useTicketsStore } from '../store/tickets.store';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import type { ITicket } from '../../domain/entities/Ticket';

// Convertido as stores dinâmicas para 'any' permitindo tipagem mista nos métodos da store Pinia
const store = useTicketsStore() as any;
const kanbanStore = useKanbanStore() as any;
const customerStore = useCustomerStore() as any;

const isModalOpen = ref(false);
const selectedTicket = ref<ITicket | null>(null);

const currentFilters = ref<any>({
  query: '',
  status: 'all',
  customers: [],
  dateRange: null,
  assignees: [],
  ownerOnly: false
});

const openTickets = computed(() => store.items.filter((t: any) => t.status === 'open' || t.status === 'pending_approval').length);
const inProgressTickets = computed(() => store.items.filter((t: any) => t.status === 'in-progress').length);
const resolvedTickets = computed(() => store.items.filter((t: any) => t.status === 'resolved').length);

const handleFilter = (filters: any) => {
  if (typeof store.setFilters === 'function') {
      store.setFilters({ ...filters, ownerId: '1' });
  } else if (typeof store.applyFilters === 'function') {
      store.applyFilters({ ...filters, ownerId: '1' });
  }
};

const openModal = (ticket?: ITicket) => {
  selectedTicket.value = ticket ? { ...ticket } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedTicket.value = null;
};

const saveTicket = async (ticketData: any) => {
  try {
    if (ticketData.id) {
      const numericId = Number(ticketData.id);
      if (typeof store.updateTicket === 'function') {
          await store.updateTicket(numericId, ticketData);
      } else if (typeof store.update === 'function') {
          await store.update(numericId, ticketData);
      }
      ElMessage.success('Ticket atualizado com sucesso!');
    } else {
      if (typeof store.createTicket === 'function') {
          await store.createTicket(ticketData);
      } else if (typeof store.create === 'function') {
          await store.create(ticketData);
      }
      ElMessage.success('Ticket criado com sucesso!');
    }
    closeModal();
  } catch (error) {
    console.error(error);
  }
};

const handleApproveKanban = async (ticketData: any) => {
    try {
        await ElMessageBox.confirm(
            'Deseja aprovar este ticket e enviar para a fila do Kanban escolhida?',
            'Aprovar Triagem',
            {
                confirmButtonText: 'Sim, Aprovar',
                cancelButtonText: 'Cancelar',
                type: 'success'
            }
        );

        ticketData.status = 'open';
        
        // Conversão robusta de String | Number explícita para Numérica
        if (ticketData.id) {
            const numericId = Number(ticketData.id);
            if (typeof store.updateTicket === 'function') {
                await store.updateTicket(numericId, ticketData);
            } else if (typeof store.update === 'function') {
                await store.update(numericId, ticketData);
            }
        } else {
            if (typeof store.createTicket === 'function') {
                await store.createTicket(ticketData);
            } else if (typeof store.create === 'function') {
                await store.create(ticketData);
            }
        }

        const originalTags = Array.isArray(ticketData.tags) ? ticketData.tags : [];
        const kanbanTags = originalTags.map((tag: string | any) => {
            const tagLabel = typeof tag === 'string' ? tag : tag.label;
            let colorClass = 'bg-slate-100 text-slate-700';
            if (tagLabel === 'Bug') colorClass = 'bg-red-100 text-red-700';
            else if (tagLabel === 'Urgente') colorClass = 'bg-orange-100 text-orange-700';
            return { label: tagLabel, colorClass };
        });

        const cardId = `kb-${Date.now()}`;
        const newKanbanCard = {
            ...ticketData,
            id: cardId,
            title: ticketData.title || ticketData.subject || 'Ticket sem título',
            tags: kanbanTags
        };

        const targetBoardId = ticketData.boardId || kanbanStore.boards[0]?.id;
        const targetBoard = kanbanStore.boards.find((b: any) => String(b.id) === String(targetBoardId));

        if (targetBoard) {
            const targetColId = ticketData.status === 'pending_approval' ? targetBoard.columns[0].id : ticketData.status;
            let targetCol = targetBoard.columns.find((c: any) => String(c.id) === String(targetColId));
            
            if (!targetCol && targetBoard.columns.length > 0) targetCol = targetBoard.columns[0];
            
            if (targetCol) {
                newKanbanCard.status = targetCol.id;
                targetCol.cards.push(newKanbanCard);
            }
        }

        kanbanStore.boards = [...kanbanStore.boards];
        if (typeof kanbanStore.saveBoard === 'function') await kanbanStore.saveBoard();

        ElMessage.success('Ticket aprovado para o Kanban!');
        
        closeModal();
    } catch (error) {
        console.log('Aprovação cancelada ou erro:', error);
    }
};

onMounted(async () => {
  if (typeof store.fetchTickets === 'function') {
      store.fetchTickets();
  } else if (typeof store.fetch === 'function') {
      store.fetch();
  }
  
  await kanbanStore.fetchKanbanData();
  
  if (customerStore.items?.length === 0) {
    if (typeof customerStore.fetch === 'function') await customerStore.fetch();
  }
});
</script>