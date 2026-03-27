<template>
  <div class="h-[calc(100vh-4rem)] bg-[#f8fafc] overflow-y-auto custom-scrollbar">
    <div class="max-w-[1600px] mx-auto w-full p-6 flex flex-col min-h-full">
      <div class="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 class="text-[28px] font-black text-slate-800 leading-none mb-1">Gestão de Tickets</h1>
          <p class="text-[13px] font-medium text-slate-400">Gerencie todos os tickets de atendimento</p>
        </div>
        <el-button type="primary" size="large" class="!rounded-xl !font-bold shadow-md shadow-blue-200"
          @click="openCreateModal">
          <el-icon class="mr-2">
            <Plus />
          </el-icon> Novo Ticket
        </el-button>
      </div>

      <TicketStats class="shrink-0" :total="store.total" :open="store.openTickets"
        :in-progress="store.inProgressTickets" :resolved="store.resolvedTickets" />

      <div v-if="store.loading && store.items.length === 0" class="flex justify-center p-10 flex-1 items-center">
        <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      <div v-else
        class="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 border-b border-slate-100 bg-white shrink-0">
          <TicketFilters :filters="store.filter" @update:filters="store.applyFilters" />
        </div>
        <div class="flex-1 overflow-auto">
          <TicketTable :tickets="store.items" @view="handleViewTicket" @edit="handleEditTicket"
            @delete="handleDeleteTicket" @convert-to-kb="handleConvertToKb" class="!border-none !rounded-none" />
        </div>
        <div
          class="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Página {{ store.currentPage }} de {{ Math.ceil(store.filteredTotal / store.pageSize) || 1 }}
          </span>
          <el-pagination :current-page="store.currentPage" :page-size="store.pageSize" :page-sizes="[10, 20, 50, 100]"
            :total="store.filteredTotal" layout="sizes, prev, pager, next" background @size-change="store.setPageSize"
            @current-change="store.setPage" />
        </div>
      </div>
    </div>
  </div>

  <TicketModal :is-open="isModalOpen" :ticket="currentTicket" :is-viewing="isViewing" @close="closeModal"
    @save="handleSave" @switch-edit="isViewing = false" @approve-kanban="handleApproveKanban" />

  <ArticleFormModal v-if="isKbModalOpen" :is-open="isKbModalOpen" :article="kbArticleData"
    @close="isKbModalOpen = false" @save="handleSaveKbArticle" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { useTicketsStore } from '../store/tickets.store';
import TicketStats from '../components/TicketStats.vue';
import TicketFilters from '../components/TicketFilters.vue';
import TicketTable from '../components/TicketTable.vue';
import TicketModal from '../components/TicketModal.vue';
import type { ITicket } from '../../domain/entities/Ticket';
import { ElMessage, ElMessageBox } from 'element-plus';

import ArticleFormModal from '@/modules/kb/ui/components/ArticleFormModal.vue';
import { useKbStore } from '@/modules/kb/ui/store/kb.store';
import { kanbanServices } from '@/modules/kanban/data/kanban.services';
import { KanbanStatus } from '@/modules/kanban/domain/valueObjects/kanban-status.enum';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';

const store = useTicketsStore();
const isModalOpen = ref(false);
const currentTicket = ref<ITicket | undefined>(undefined);
const isViewing = ref(false);

const isKbModalOpen = ref(false);
const kbArticleData = ref<any>(null);

onMounted(async () => {
  await store.fetch();
});

const openCreateModal = () => {
  currentTicket.value = undefined;
  isViewing.value = false;
  isModalOpen.value = true;
};

const handleViewTicket = (ticket: ITicket) => {
  currentTicket.value = ticket;
  isViewing.value = true;
  isModalOpen.value = true;
};

const handleEditTicket = (ticket: ITicket) => {
  currentTicket.value = ticket;
  isViewing.value = false;
  isModalOpen.value = true;
};

const handleDeleteTicket = async (id: number) => {
  try {
    await store.deleteTicket(id);
    ElMessage.success('Ticket excluído com sucesso.');
  } catch (error) {
    ElMessage.error('Falha ao excluir o ticket.');
  }
};

const handleSave = async (ticketData: any) => {
  try {
    if (currentTicket.value) {
      await store.updateTicket(currentTicket.value.id, ticketData);
    } else {
      await store.createTicket(ticketData);
    }
    closeModal();
    ElMessage.success('Ticket guardado com sucesso.');
  } catch (error) {
    ElMessage.error('Falha ao salvar o ticket.');
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  currentTicket.value = undefined;
  isViewing.value = false;
};

const handleConvertToKb = (ticket: ITicket) => {
  const ticketContent = ticket.description || '<p>Nenhuma descrição fornecida.</p>';
  const finalHtmlContent = `
        <p><strong>Problema/Chamado Original:</strong> ${ticket.title}</p>
        <hr/>
        ${ticketContent}
    `;

  kbArticleData.value = {
    title: `Resolução: ${ticket.title}`,
    category: 'Suporte',
    content: finalHtmlContent,
    icon: 'Document',
    status: 'Rascunho'
  };
  isKbModalOpen.value = true;
};

const handleSaveKbArticle = async (articleData: any) => {
  try {
    const kbStore = useKbStore();
    // Utilizando saveArticle em vez de createArticle para corresponder à store atual
    await kbStore.saveArticle(articleData);
    // O ElMessage de sucesso foi removido, pois a store já notifica o utilizador
    isKbModalOpen.value = false;
  } catch (error) {
    ElMessage.error('Erro ao processar o artigo.');
  }
};

const handleApproveKanban = async (ticketData: any) => {
  try {
    await ElMessageBox.confirm(
      'Deseja aprovar este ticket e enviar para a fila de desenvolvimento do Kanban?',
      'Aprovar Triagem',
      { confirmButtonText: 'Sim, Aprovar', cancelButtonText: 'Cancelar', type: 'success' }
    );

    ticketData.status = 'open';

    if (ticketData.id) {
      await store.updateTicket(ticketData.id, ticketData);
    } else {
      await store.createTicket(ticketData);
    }

    const computedPriority = (ticketData.priority === 'urgent' || ticketData.priority === 'high') ? 'high' : 'medium';
    const originalTags = Array.isArray(ticketData.tags) ? ticketData.tags : [];
    const kanbanTags = originalTags.map((tag: string) => {
      let colorClass = 'bg-slate-100 text-slate-700';
      if (tag === 'Bug') colorClass = 'bg-red-100 text-red-700';
      else if (tag === 'Crítico') colorClass = 'bg-pink-100 text-pink-700';
      else if (tag === 'Urgente') colorClass = 'bg-orange-100 text-orange-700';
      else if (tag === 'Nova Funcionalidade') colorClass = 'bg-green-100 text-green-700';
      else if (tag === 'Melhoria') colorClass = 'bg-blue-100 text-blue-700';
      return { label: tag, colorClass };
    });

    const cardId = `kb-${Date.now()}`;
    const newKanbanCard = {
      ...ticketData,
      id: cardId,
      title: ticketData.title || ticketData.subject || 'Ticket sem título',
      description: ticketData.description || 'Originado do atendimento',
      customerName: ticketData.customer || 'Desconhecido',
      customer: ticketData.customer || 'Desconhecido',
      status: KanbanStatus.TODO,
      priority: computedPriority as 'high' | 'medium' | 'low',
      dateDisplay: new Date().toLocaleDateString('pt-BR'),
      avatars: ticketData.assignees || [],
      tags: kanbanTags
    };

    try {
      await kanbanServices.createCard(newKanbanCard);
    } catch (apiError) {
      console.warn('kanbanServices.createCard falhou', apiError);
    }

    const kanbanStore = useKanbanStore();
    if (kanbanStore.columns && kanbanStore.columns.length > 0) {
      const todoCol = kanbanStore.columns.find((c: any) => c.id === KanbanStatus.TODO || c.id === 'todo');
      if (todoCol) {
        todoCol.cards.push(newKanbanCard);
      } else {
        kanbanStore.columns[0].cards.push(newKanbanCard);
      }
    }

    ElMessage.success('Ticket aprovado e enviado para o Kanban com sucesso!');
    isModalOpen.value = false;
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Erro ao enviar o ticket para o Kanban.');
      console.error(error);
    }
  }
};
</script>