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

    <div class="flex-1 flex gap-3 overflow-x-auto pb-4 custom-scroll-x items-start" @dragover.prevent @drop="onDropColumns">
      <div v-for="(col, index) in kanbanStore.columns" :key="col.id" draggable="true"
        @dragstart="onDragStartColumn($event, index)" @dragover.prevent @dragenter="onDragEnterColumn($event, index)"
        :class="['min-w-[270px] transition-opacity', draggedIndex === index ? 'opacity-50' : '']" :data-index="index">
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
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, MoreFilled } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useKanbanStore } from '../store/kanban.store';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';
import KanbanColumn from '../components/KanbanColumn.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';

const kanbanStore = useKanbanStore() as any;
const ticketsStore = useTicketsStore() as any;
const customerStore = useCustomerStore() as any;

const isModalOpen = ref(false);
const selectedTicket = ref<ITicket | null>(null);
const draggedIndex = ref<number | null>(null);

const onDragStartColumn = (event: DragEvent, index: number | string) => {
  draggedIndex.value = Number(index);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onDragEnterColumn = (event: DragEvent, index: number | string) => {
  const idx = Number(index);
  if (draggedIndex.value === null || draggedIndex.value === idx) return;
  
  const columns = [...kanbanStore.columns];
  const draggedCol = columns[draggedIndex.value];
  columns.splice(draggedIndex.value, 1);
  columns.splice(idx, 0, draggedCol);
  
  const board = kanbanStore.boards.find((b: any) => b.id === kanbanStore.activeBoardId);
  if (board) {
    board.columns = columns;
  }
  
  draggedIndex.value = idx;
};

const onDropColumns = async () => {
  if (draggedIndex.value === null) return;
  
  const columnIds = kanbanStore.columns.map((c: any) => c.id);
  await kanbanStore.reorderColumns(columnIds);
  
  draggedIndex.value = null;
};

onMounted(async () => {
  await kanbanStore.fetchKanbanData();
  if (customerStore.items?.length === 0) {
    if (typeof customerStore.fetch === 'function') await customerStore.fetch();
  }
});

const promptCreateBoard = () => {
  ElMessageBox.prompt('Digite o nome do novo Quadro Kanban:', 'Novo Quadro Kanban', {
    confirmButtonText: 'Criar',
    cancelButtonText: 'Cancelar',
    inputPattern: /.+/,
    inputErrorMessage: 'O nome não pode ser vazio'
  }).then(({ value }) => {
    kanbanStore.createBoard(value);
  }).catch(() => {});
};

const handleBoardCommand = async (command: string) => {
  if (command === 'default') {
    await kanbanStore.setDefaultBoard(kanbanStore.activeBoardId);
  } else if (command === 'edit') {
    const board = kanbanStore.boards.find((b: any) => b.id === kanbanStore.activeBoardId);
    if (!board) return;
    
    ElMessageBox.prompt('Digite o novo nome do quadro:', 'Editar Quadro', {
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      inputValue: board.title,
      inputPattern: /.+/,
      inputErrorMessage: 'O nome não pode ser vazio'
    }).then(({ value }) => {
      kanbanStore.updateBoardTitle(kanbanStore.activeBoardId, value);
    }).catch(() => {});
  } else if (command === 'delete') {
    ElMessageBox.confirm(
      'Tem a certeza que deseja excluir este quadro e todas as suas colunas e tarefas?',
      'Atenção',
      {
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }
    ).then(() => {
      kanbanStore.removeBoard(kanbanStore.activeBoardId);
    }).catch(() => {});
  }
};

const handleRemoveColumn = (id: string) => {
  ElMessageBox.confirm(
    'Tem a certeza que deseja excluir esta coluna e todas as suas tarefas?',
    'Atenção',
    {
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(() => {
    kanbanStore.removeColumn(id);
  }).catch(() => {});
};

const openNewTicketModal = () => {
  selectedTicket.value = null;
  isModalOpen.value = true;
};

const openTicketDetails = (ticket: any) => {
  const formattedTicket = JSON.parse(JSON.stringify(ticket));
  if (Array.isArray(formattedTicket.tags)) {
    formattedTicket.tags = formattedTicket.tags.map((tag: any) => {
      return typeof tag === 'string' ? tag : (tag?.label || tag?.name || tag?.value || '');
    }).filter(Boolean);
  } else {
    formattedTicket.tags = [];
  }
  selectedTicket.value = formattedTicket;
  isModalOpen.value = true;
};

const onTicketSaved = async (ticketData: any) => {
  isModalOpen.value = false;
  let ticketId = ticketData.id || selectedTicket.value?.id;

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

  if (ticketId) {
    try {
      const numericId = Number(ticketId);
      if (typeof ticketsStore.updateTicket === 'function') {
        await ticketsStore.updateTicket(numericId || ticketId, ticketData);
      } else if (typeof ticketsStore.update === 'function') {
        await ticketsStore.update(numericId || ticketId, ticketData);
      }
    } catch (error) {
      console.warn("Ignorado: O Ticket principal não encontrou este ID do Kanban.");
    }

    let existingCard = null;
    let sourceColId = null;
    let sourceBoardId = null;

    for (const b of kanbanStore.boards) {
        for (const col of b.columns) {
            const card = col.cards.find((c: any) => String(c.id) === String(ticketId));
            if (card) {
                existingCard = { ...card };
                sourceColId = col.id;
                sourceBoardId = b.id;
                break;
            }
        }
    }

    if (existingCard) {
      const updatedCard = { ...existingCard, ...ticketData };

      const sourceBoard = kanbanStore.boards.find((b: any) => String(b.id) === String(sourceBoardId));
      if (sourceBoard) {
          const sourceCol = sourceBoard.columns.find((c: any) => String(c.id) === String(sourceColId));
          if (sourceCol) {
              sourceCol.cards = sourceCol.cards.filter((c: any) => String(c.id) !== String(ticketId));
          }
      }

      const targetBoardId = ticketData.boardId || sourceBoardId || kanbanStore.activeBoardId;
      const targetBoard = kanbanStore.boards.find((b: any) => String(b.id) === String(targetBoardId));
      
      if (targetBoard) {
          const targetColId = ticketData.status || sourceColId;
          let targetCol = targetBoard.columns.find((c: any) => String(c.id) === String(targetColId));
          if (!targetCol && targetBoard.columns.length > 0) targetCol = targetBoard.columns[0];
          
          if (targetCol) {
              updatedCard.status = targetCol.id;
              targetCol.cards.push(updatedCard);
          }
      }

      kanbanStore.boards = [...kanbanStore.boards];
      if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();
      ElMessage.success('Ticket atualizado e movido!');
    }
  } else {
    ticketId = Math.floor(Math.random() * 1000000);
    ticketData.id = ticketId;

    try {
      if (typeof ticketsStore.createTicket === 'function') {
        await ticketsStore.createTicket(ticketData);
      } else if (typeof ticketsStore.create === 'function') {
        await ticketsStore.create(ticketData);
      }
    } catch (e) {
      console.warn("Ignorado: Falha ao tentar criar na listagem principal.");
    }

    const targetBoardId = ticketData.boardId || kanbanStore.activeBoardId;
    const targetBoard = kanbanStore.boards.find((b: any) => String(b.id) === String(targetBoardId));

    if (targetBoard) {
        if (!ticketData.status || !targetBoard.columns.some((c: any) => String(c.id) === String(ticketData.status))) {
            ticketData.status = targetBoard.columns[0]?.id || 'todo';
        }

        const colIndex = targetBoard.columns.findIndex((c: any) => String(c.id) === String(ticketData.status));
        if (colIndex !== -1) {
            targetBoard.columns[colIndex].cards.push({ ...ticketData });
        } else if (targetBoard.columns.length > 0) {
            targetBoard.columns[0].cards.push({ ...ticketData });
        }
    }

    kanbanStore.boards = [...kanbanStore.boards];
    if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();
    ElMessage.success('Novo ticket adicionado ao Kanban!');
  }
};
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