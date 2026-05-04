<template>
  <div class="h-[calc(100vh-4rem)] p-6 bg-[#f8fafd] flex flex-col overflow-hidden">
    <div class="mb-6 flex flex-col md:flex-row justify-between md:items-center shrink-0 gap-4">
      <div class="flex items-center gap-4 flex-wrap">
        <div>
          <h2 class="text-2xl font-black text-slate-800">Kanban Board</h2>
          <p class="text-slate-500 text-sm font-medium mt-1">Gerencie múltiplos quadros e fluxos de trabalho</p>
        </div>

        <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm ml-0 md:ml-4">
          <el-select v-model="kanbanStore.activeBoardId" @change="kanbanStore.setActiveBoard(kanbanStore.activeBoardId)" placeholder="Selecione" class="!w-40" style="border: none;">
            <el-option v-for="board in kanbanStore.boards" :key="board.id" :label="board.title" :value="board.id" />
          </el-select>
          <div class="w-px h-6 bg-slate-200 mx-1"></div>
          <el-dropdown trigger="click" @command="handleBoardCommand">
            <el-button plain class="!border-none !text-slate-500 hover:!text-blue-600 hover:!bg-blue-50">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="default">Definir como Padrão</el-dropdown-item>
                <el-dropdown-item command="edit">Editar Nome</el-dropdown-item>
                <el-dropdown-item command="delete" divided command-type="danger">Excluir Quadro</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button plain @click="promptCreateBoard" class="!border-none !text-slate-500 hover:!text-blue-600 hover:!bg-blue-50" title="Criar Novo Quadro">
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
      </div>
      
      <el-button type="primary" size="large" class="!font-bold !rounded-lg shadow-sm" @click="openNewTicketModal">
        <el-icon class="mr-2">
          <Plus />
        </el-icon>
        Novo Ticket
      </el-button>
    </div>

    <div class="flex-1 flex gap-3 overflow-x-auto pb-4 custom-scroll-x items-start">
      <div v-for="(col, index) in kanbanStore.columns" :key="col.id" :draggable="canMoveColumns"
        @dragstart="onDragStartColumn($event, Number(index))" @dragend="onDragEndColumn($event)" @dragover="onDragOverColumn($event)" @dragenter="onDragEnterColumn($event, Number(index))" @drop="onDropColumns($event, Number(index))"
        :class="['min-w-[270px]', draggedIndex === index ? 'opacity-50' : 'opacity-100']" :data-index="index">
        <KanbanColumn 
          :column-id="col.id" 
          v-model:title="col.title" 
          :color="col.color" 
          :cards="col.cards" 
          @remove="handleRemoveColumn" 
          @open-ticket="openTicketDetails"
          @update:title="(title) => kanbanStore.updateColumn(col.id, { title })"
        />
      </div>
      
      <button @click="kanbanStore.addColumn()" class="min-w-[270px] h-[670px] flex items-center justify-center gap-2 py-4 bg-transparent rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all font-bold cursor-pointer">
        <el-icon>
          <Plus />
        </el-icon>
        Adicionar Lista
      </button>
    </div>

    <TicketModal 
      :is-open="isModalOpen" 
      :ticket="selectedTicket" 
      :is-kanban="true"
      append-to-body
      @close="isModalOpen = false" 
      @save="onTicketSaved"
      @approve-kanban="onTicketApproved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, MoreFilled } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useKanbanStore } from '../store/kanban.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { kanbanServices } from '../../data/kanban.services';
import { ticketServices } from '@/modules/tickets/data/ticket.services';
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';
import KanbanColumn from '../components/KanbanColumn.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';

const kanbanStore = useKanbanStore() as any;
const customerStore = useCustomerStore() as any;
const authStore = useAuthStore() as any;

const canMoveColumns = computed(() => authStore.hasRole(['Desenvolvedor', 'Gerente', 'Administrador']));

const isModalOpen = ref(false);
const selectedTicket = ref<ITicket | null>(null);
const selectedCard = ref<any>(null); // ← ADDED!
const draggedIndex = ref<number | null>(null);

const onDragStartColumn = (event: DragEvent, index: number) => {
  if (!canMoveColumns.value) {
    event.preventDefault();
    return;
  }
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDragEnterColumn = (event: DragEvent, index: number) => {
  event.preventDefault();
  event.stopPropagation();
};

const onDragOverColumn = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const onDragEndColumn = (event: DragEvent) => {
  draggedIndex.value = null;
};

const onDropColumns = async (event: DragEvent, targetIndex: number) => {
  event.preventDefault();
  event.stopPropagation();
  
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) {
    draggedIndex.value = null;
    return;
  }
  
  const board = kanbanStore.boards.find((b: any) => b.id === kanbanStore.activeBoardId);
  if (board && board.columns) {
    const columns = [...board.columns];
    const [movedCol] = columns.splice(draggedIndex.value, 1);
    columns.splice(targetIndex, 0, movedCol);
    
    board.columns = columns;
    
    const columnIds = columns.map((c: any) => c.id);
    
    try {
      if (typeof kanbanStore.reorderColumns === 'function') {
        await kanbanStore.reorderColumns(columnIds);
      }
    } catch (e) {
      console.error('[KanbanPage] Error reordering:', e);
    }
  }
  
  draggedIndex.value = null;
};

const openNewTicketModal = () => {
  selectedTicket.value = null;
  isModalOpen.value = true;
};

const openTicketDetails = (ticket: any) => {
  console.log('[KanbanPage] ===== ABRINDO CARD =====');
  console.log('[KanbanPage] ticket:', ticket);
  
  selectedCard.value = ticket;
  const cardId = ticket?.id;
  const ticketId = ticket?.ticketId;
  
  // Usar boardId do card se disponível, senão usar activeBoardId
  const boardId = ticket?.boardId || kanbanStore.activeBoardId;
  
  if (ticketId) {
    selectedTicket.value = {
      ...ticket,
      id: ticketId,
      cardId: cardId,
      boardId: boardId,
      checklist: Array.isArray(ticket?.checklist) ? ticket.checklist : [],
    };
  } else {
    selectedTicket.value = {
      ...ticket,
      id: undefined,
      cardId: cardId,
      boardId: boardId,
      checklist: [],
    };
  }
  
  console.log('[KanbanPage] selectedTicket FINAL:', selectedTicket.value);
  isModalOpen.value = true;
};

const handleBoardCommand = async (command: string) => {
  const board = kanbanStore.boards.find((b: any) => b.id === kanbanStore.activeBoardId);
  if (!board) return;

  if (command === 'default') {
    ElMessage.success('Quadro definido como padrão!');
  } else if (command === 'edit') {
    ElMessageBox.prompt('Novo nome do quadro', 'Editar Quadro', {
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      inputValue: board.title,
    }).then(async ({ value }) => {
      await kanbanStore.updateBoard(board.id, { title: value });
      ElMessage.success('Quadro atualizado!');
    }).catch(() => {});
  } else if (command === 'delete') {
    ElMessageBox.confirm('Excluir este quadro?', 'Atenção', {
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
      type: 'warning',
    }).then(async () => {
      await kanbanStore.removeBoard(board.id);
      ElMessage.success('Quadro excluído!');
    }).catch(() => {});
  }
};

const promptCreateBoard = async () => {
  ElMessageBox.prompt('Nome do novo quadro', 'Criar Quadro', {
    confirmButtonText: 'Criar',
    cancelButtonText: 'Cancelar',
  }).then(async ({ value }) => {
    if (value) {
      await kanbanStore.createBoard(value);
    }
  }).catch(() => {});
};

const handleRemoveColumn = async (columnId: string) => {
  ElMessageBox.confirm('Excluir esta lista?', 'Atenção', {
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    type: 'warning',
  }).then(async () => {
    await kanbanStore.removeColumn(columnId);
    ElMessage.success('Lista excluída!');
  }).catch(() => {});
};

const onTicketSaved = async (ticketData: any) => {
  isModalOpen.value = false;
  const ticketId = selectedTicket.value?.id;
  
  try {
    const ticketPayload = { ...ticketData };
    delete ticketPayload.cardId;
    delete ticketPayload.columnId;
    delete ticketPayload.column;
    
    ticketPayload.tags = (ticketData.tags || []).map((tag: any) => {
      if (typeof tag === 'object' && tag !== null) {
        return { name: tag.label || tag.name || tag, color: tag.colorClass?.split(' ')[0]?.replace('bg-', '') || 'info' };
      }
      return { name: String(tag), color: 'info' };
    });

    if (ticketId && typeof ticketId === 'string' && ticketId.length > 0) {
      await ticketServices.update(ticketId, ticketPayload);
    } else {
      await ticketServices.create(ticketPayload);
    }
    
    // O backend aguarda a sincronização ser concluída através do emitAsync.
    // Basta recarregar os dados do Kanban para refletir as mudanças instantaneamente.
    await kanbanStore.fetchKanbanData();
    
    ElMessage.success('Ticket salvo com sucesso!');
  } catch (e: any) {
    console.error('Erro ao salvar ticket:', e);
    ElMessage.error(e?.message || 'Erro ao salvar ticket');
  }
};

const onTicketApproved = async (ticketData: any) => {
  console.log('[onTicketApproved] ticketData:', ticketData);
  console.log('[onTicketApproved] columns:', kanbanStore.columns);
  
  try {
    const board = kanbanStore.boards?.find((b: any) => b.id === ticketData.boardId) || kanbanStore.boards?.[0];
    const targetCol = board?.columns?.find((c: any) => c.title.toLowerCase().includes('fazer')) || kanbanStore.columns.find((c: any) => c.title.toLowerCase().includes('fazer'));
    console.log('[onTicketApproved] targetCol:', targetCol);
    
    if (targetCol) {
      ticketData.status = targetCol.title;
      ticketData.columnId = targetCol.id;
    }
    
    console.log('[onTicketApproved] ticketData after update:', ticketData);
    
    const formattedTags = (ticketData.tags || []).map((tag: any) => {
      if (typeof tag === 'object' && tag !== null) {
        return { label: tag.name || tag.label || String(tag), colorClass: tag.colorClass || 'bg-slate-100 text-slate-700' };
      }
      const label = String(tag);
      return { label, colorClass: 'bg-slate-100 text-slate-700' };
    });
    ticketData.tags = formattedTags;
    
    if (ticketData.cardId) {
      await kanbanServices.updateCard(ticketData.cardId, ticketData);
    } else {
      await kanbanServices.createCard(ticketData);
    }
    
    await kanbanStore.fetchKanbanData();
    isModalOpen.value = false;
    ElMessage.success('Ticket aprovado e movido para "A Fazer"!');
  } catch (e) {
    console.error('Erro ao aprobar:', e);
    ElMessage.error('Erro ao aprobar ticket');
  }
};

onMounted(async () => {
  await kanbanStore.fetchKanbanData();
});
</script>

<style scoped>
.custom-scroll-x {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}
.custom-scroll-x::-webkit-scrollbar {
  height: 8px;
}
.custom-scroll-x::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll-x::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>