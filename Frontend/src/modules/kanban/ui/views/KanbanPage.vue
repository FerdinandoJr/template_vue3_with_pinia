<template>
  <div class="h-[calc(100vh-4rem)] p-6 bg-[#f8fafd] flex flex-col overflow-hidden">
    <div class="mb-6 flex flex-col md:flex-row justify-between md:items-center shrink-0 gap-4">
      <div class="flex items-center gap-4 flex-wrap">
        <div>
          <h2 class="text-2xl font-black text-slate-800">Kanban Board</h2>
          <p class="text-slate-500 text-sm font-medium mt-1">Gerencie múltiplos quadros e fluxos de trabalho</p>
        </div>

        <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm ml-0 md:ml-4">
          <el-select v-model="kanbanStore.activeBoardId" placeholder="Selecione" class="!w-40" style="border: none;">
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
        @dragstart="onDragStartColumn($event, index)" @dragend="onDragEndColumn($event)" @dragover="onDragOverColumn($event)" @dragenter="onDragEnterColumn($event, index)" @drop="onDropColumns($event, index)"
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
      v-if="isModalOpen" 
      :is-open="isModalOpen" 
      :ticket="selectedTicket" 
      :initial-data="selectedTicket || {}" 
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
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';
import KanbanColumn from '../components/KanbanColumn.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';

const kanbanStore = useKanbanStore() as any;
const customerStore = useCustomerStore() as any;
const authStore = useAuthStore() as any;

const canMoveColumns = computed(() => authStore.hasRole(['Desenvolvedor', 'Gerente', 'Administrador']));

const isModalOpen = ref(false);
const selectedTicket = ref<ITicket | null>(null);
const draggedIndex = ref<number | null>(null);

const onDragStartColumn = (event: DragEvent, index: number | string) => {
  if (!canMoveColumns.value) {
    event.preventDefault();
    return;
  }
  draggedIndex.value = Number(index);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDragEnterColumn = (event: DragEvent, index: number | string) => {
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
  console.log('[openTicketDetails] ticket before:', ticket);
  console.log('[openTicketDetails] ticket.tags:', ticket?.tags);
  
  const ticketCopy = JSON.parse(JSON.stringify(ticket));
  console.log('[openTicketDetails] ticketCopy after parse:', ticketCopy);
  
  if (ticketCopy.tags && Array.isArray(ticketCopy.tags)) {
    ticketCopy.tags = ticketCopy.tags.map((tag: any) => {
      console.log('[openTicketDetails] processing tag:', tag, 'type:', typeof tag);
      if (typeof tag === 'object' && tag !== null) {
        const name = tag.label || tag.name;
        console.log('[openTicketDetails] tag name extracted:', name);
        return name || '[Sem Nome]';
      }
      const strTag = String(tag);
      return strTag === '[object Object]' ? '[Sem Nome]' : strTag;
    });
  } else {
    ticketCopy.tags = [];
  }
  
  console.log('[openTicketDetails] ticketCopy.tags after map:', ticketCopy.tags);
  selectedTicket.value = ticketCopy;
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
      console.log('[KanbanPage] Chamando removeBoard para:', board.id);
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
  console.log('[onTicketSaved] ticketData:', ticketData);
  console.log('[onTicketSaved] ticketData.status:', ticketData.status);
  console.log('[onTicketSaved] kanbanStore.columns:', kanbanStore.columns);
  
  isModalOpen.value = false;
  
  const kanbanFriendlyTags = (ticketData.tags || []).map((tag: any) => {
    if (typeof tag === 'object' && tag !== null && tag.label) return tag;
    const label = String(tag);
    let colorClass = 'bg-slate-100 text-slate-700';
    if (label === 'Bug') colorClass = 'bg-red-100 text-red-700';
    else if (label === 'Crítico') colorClass = 'bg-pink-100 text-pink-700';
    else if (label === 'Urgente') colorClass = 'bg-orange-100 text-orange-700';
    else if (label === 'Nova Funcionalidade') colorClass = 'bg-green-100 text-green-700';
    else if (label === 'Melhoria') colorClass = 'bg-blue-100 text-blue-700';
    return { label, colorClass };
  });

  ticketData.tags = kanbanFriendlyTags;
  
  const ticketId = ticketData.id || selectedTicket.value?.id;
  const canApprove = authStore.hasRole(['Desenvolvedor', 'Gerente', 'Administrador']);
  
  let selectedStatus = ticketData.status;
  let selectedBoardId = ticketData.boardId;
  
  let foundCard: any = null;
  let foundBoard: any = null;
  let foundCol: any = null;
  
  console.log('[onTicketSaved] foundCard:', foundCard?.title);
  console.log('[onTicketSaved] foundCol:', foundCol?.title);
  console.log('[onTicketSaved] selectedBoardId:', selectedBoardId);
  console.log('[onTicketSaved] foundBoard?.id:', foundBoard?.id);
  
  // Se mudou de board, procura no novo board
  if (selectedBoardId && foundBoard && foundBoard.id !== selectedBoardId) {
    foundCard = null;
    foundCol = null;
    foundBoard = null;
  }
  
  if (ticketId && !foundCard) {
    for (const b of kanbanStore.boards) {
      for (const col of b.columns) {
        const card = col.cards.find((c: any) => String(c.ticketId) === String(ticketId) || c.id === ticketId);
        if (card) {
          foundCard = card;
          foundBoard = b;
          foundCol = col;
          break;
        }
      }
      if (foundCard) break;
    }
  }
  
  if (foundCard && foundCol) {
    foundCol.cards = foundCol.cards.filter((c: any) => c.id !== foundCard.id);
  }
  
  let targetCol: any = null;
  let targetBoard: any = null;
  
  console.log('[onTicketSaved] searching for column with status:', selectedStatus);
  console.log('[onTicketSaved] canApprove:', canApprove);
  
  // Primeiro, identifica qual board usar
  let boardsToSearch = kanbanStore.boards;
  if (selectedBoardId) {
    const selectedBoard = kanbanStore.boards.find((b: any) => b.id === selectedBoardId);
    if (selectedBoard) {
      boardsToSearch = [selectedBoard];
      targetBoard = selectedBoard;
      console.log('[onTicketSaved] using selected board:', selectedBoard.title);
    }
  }
  
  for (const b of boardsToSearch) {
    const cols = b.columns || [];
    console.log('[onTicketSaved] board:', b.title, 'columns:', cols.map((c: any) => c.title));
    let col: any = null;
    
    if (selectedStatus) {
      col = cols.find((c: any) => c.title === selectedStatus || c.title.toLowerCase().includes(selectedStatus.toLowerCase()));
      console.log('[onTicketSaved] found column for status:', col?.title);
    }
    
    if (!col && !canApprove) {
      col = cols.find((c: any) => c.title.toLowerCase().includes('pendente')) || cols[0];
    }
    
    if (!col) {
      col = cols.find((c: any) => c.title.toLowerCase().includes('fazer')) || cols[1] || cols[0];
    }
    
    if (col) {
      targetCol = col;
      targetBoard = b;
      console.log('[onTicketSaved] targetCol found:', targetCol.title);
      break;
    }
  }
  
  // Se tinha board selecionado e não encontrou coluna, usa o primeiro board disponível
  if (!targetCol && selectedBoardId && kanbanStore.boards.length > 0) {
    const fallbackBoard = kanbanStore.boards.find((b: any) => b.id === selectedBoardId) || kanbanStore.boards[0];
    if (fallbackBoard?.columns?.[0]) {
      targetCol = fallbackBoard.columns[0];
      targetBoard = fallbackBoard;
    }
  }
  
  console.log('[onTicketSaved] targetCol after loop:', targetCol?.title);
  
  if (!targetCol && kanbanStore.boards.length > 0) {
    const firstBoard = kanbanStore.boards[0];
    targetCol = firstBoard.columns?.[0];
    if (!targetCol) {
      const allCols = Object.values(firstBoard)?.filter((c: any) => c.cards !== undefined);
      if (allCols?.length > 0) targetCol = allCols[0];
    }
  }
  
  if (targetCol) {
    console.log('[onTicketSaved] saving to column:', targetCol.title, 'id:', targetCol.id);
    console.log('[onTicketSaved] is update:', !!foundCard, 'card id:', foundCard?.id || 'new');
    const cardId = foundCard?.id || crypto.randomUUID();
    
    const formattedTags = (ticketData.tags || []).map((tag: any) => {
      if (typeof tag === 'object' && tag !== null) {
        return { label: tag.name || tag.label || String(tag), colorClass: tag.colorClass || 'bg-slate-100 text-slate-700' };
      }
      const label = String(tag);
      return { label, colorClass: 'bg-slate-100 text-slate-700' };
    });
    
    const cardData = {
      id: cardId,
      title: ticketData.title,
      description: ticketData.description || '',
      priority: ticketData.priority || 'medium',
      type: ticketData.type || 'support',
      customerId: ticketData.customerId,
      assignees: ticketData.assignees || [],
      estimatedHours: ticketData.estimatedHours,
      tags: formattedTags,
      checklist: ticketData.checklist || [],
      ticketId: ticketId,
      status: targetCol.title,
      columnId: targetCol.id,
    };
    
    try {
      if (foundCard) {
        await kanbanServices.updateCard(cardId, cardData);
      } else {
        await kanbanServices.createCard(cardData);
      }
    } catch (e) {
      console.error('Erro ao salvar card:', e);
    }
    
    await kanbanStore.fetchKanbanData();
    
    ElMessage.success('Ticket salvo com sucesso!');
  } else {
    ElMessage.warning('Nenhuma coluna encontrada');
  }
};

const onTicketApproved = async (ticketData: any) => {
  console.log('[onTicketApproved] ticketData:', ticketData);
  console.log('[onTicketApproved] columns:', kanbanStore.columns);
  
  try {
    const targetCol = kanbanStore.columns.find((c: any) => c.title.toLowerCase().includes('fazer'));
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
    
    if (ticketData.id) {
      await kanbanServices.updateCard(ticketData.id, ticketData);
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