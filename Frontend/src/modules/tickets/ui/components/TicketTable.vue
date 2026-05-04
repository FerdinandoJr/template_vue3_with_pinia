<template>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col"
        style="height: 100%; min-height: 300px; max-height: 100%;">

        <div class="flex-1 overflow-y-auto bg-white">
            <el-table :data="tickets" style="width: 100%;" class="custom-table" highlight-current-row
                :row-class-name="() => 'cursor-pointer hover:bg-blue-50/50 transition-colors duration-150'"
                @row-click="(row: any) => $emit('view', row)">

                <el-table-column type="index" label="#" width="50" align="center"
                    class-name="font-bold text-slate-400 text-[10px]" />

                <el-table-column prop="ticketNumber" label="Nº Ticket" width="130" align="center" fixed="left">
                    <template #default="scope">
                        <el-tooltip :content="scope.row.id || ''" placement="top" :disabled="!scope.row.id">
                            <span
                                class="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs tracking-wide border border-blue-100">
                                {{ scope.row.ticketNumber || 'TKT-' + (scope.row.id || '').slice(0, 8).toUpperCase() }}
                            </span>
                        </el-tooltip>
                    </template>
                </el-table-column>

                <el-table-column prop="title" label="Título do Ticket" min-width="250" show-overflow-tooltip>
                    <template #default="scope">
                        <span
                            class="font-semibold text-slate-800 text-sm hover:text-blue-600 transition-colors cursor-pointer">
                            {{ scope.row.title }}
                        </span>
                    </template>
                </el-table-column>

                <el-table-column prop="customer" label="Cliente" min-width="180">
                    <template #default="scope">
                        <div v-if="scope.row.customer" class="flex items-center gap-2">
                            <el-icon class="text-slate-400">
                                <OfficeBuilding />
                            </el-icon>
                            <span class="font-medium text-slate-700 text-sm">
                                {{ getCustomerLabel(scope.row.customer) }}
                            </span>
                        </div>
                        <span v-else class="text-slate-400 italic text-[11px]">Sem cliente</span>
                    </template>
                </el-table-column>

                <el-table-column prop="assignee" label="Responsável" min-width="150">
                    <template #default="scope">
                        <div v-if="scope.row.assignee" class="flex items-center gap-2">
                            <el-avatar :size="24" class="bg-blue-100 text-blue-600">
                                {{ scope.row.assignee.name?.charAt(0)?.toUpperCase() }}
                            </el-avatar>
                            <span class="font-medium text-slate-700 text-sm">{{ scope.row.assignee.name }}</span>
                        </div>
                        <div v-else-if="scope.row.assignedTo" class="flex items-center gap-2">
                            <el-avatar :size="24" class="bg-slate-100 text-slate-400">
                                <el-icon>
                                    <UserFilled />
                                </el-icon>
                            </el-avatar>
                            <span class="text-slate-400 italic text-[11px]">Usuário não carregado</span>
                        </div>
                        <span v-else class="text-slate-400 italic text-[11px]">Não atribuído</span>
                    </template>
                </el-table-column>

                <el-table-column prop="status" label="Status" width="140">
                    <template #default="scope">
                        <el-tag :type="getStatusType(scope.row)" effect="light" size="small"
                            class="font-semibold border-none" round>
                            <div class="flex items-center gap-1">
                                <div class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(scope.row)">
                                </div>
                                {{ getStatusLabel(scope.row) }}
                            </div>
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="priority" label="Prioridade" width="120" align="center">
                    <template #default="scope">
                        <div class="flex items-center gap-1.5 justify-center">
                            <div class="w-2 h-2 rounded-full" :class="getPriorityDotClass(scope.row.priority)"></div>
                            <span class="text-xs font-semibold" :class="getPriorityTextClass(scope.row.priority)">
                                {{ getPriorityLabel(scope.row.priority) }}
                            </span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="createdAt" label="Criado em" width="120" align="center">
                    <template #default="scope">
                        <span class="text-xs text-slate-500 font-medium">
                            {{ formatDate(scope.row.createdAt) }}
                        </span>
                    </template>
                </el-table-column>

                <el-table-column label="Ações" width="160" align="right">
                    <template #default="scope">
                        <div class="flex justify-end gap-1.5 pr-2">
                            <el-button type="primary" circle plain size="small" @click="$emit('view', scope.row)">
                                <el-icon>
                                    <View />
                                </el-icon>
                            </el-button>
                            <el-button type="primary" circle plain size="small" @click="$emit('edit', scope.row)">
                                <el-icon>
                                    <Edit />
                                </el-icon>
                            </el-button>
                            <el-button v-if="['internal', 'resolved', 'done'].includes(String(scope.row.status))"
                                type="warning" circle plain size="small" @click="$emit('convertToKb', scope.row)">
                                <el-icon>
                                    <Notebook />
                                </el-icon>
                            </el-button>
                            <el-popconfirm title="Excluir?" @confirm="$emit('delete', scope.row.id)">
                                <template #reference>
                                    <el-button type="danger" circle plain size="small">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </template>
                </el-table-column>

                <template #empty>
                    <div class="flex flex-col items-center justify-center h-full text-slate-400 w-full py-20">
                        <el-icon :size="64" class="mb-4 opacity-20 text-slate-300">
                            <DocumentDelete />
                        </el-icon>
                        <p class="text-base font-semibold tracking-tight text-slate-500">Nenhum ticket encontrado</p>
                        <p class="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou criar um novo ticket</p>
                    </div>
                </template>
            </el-table>
        </div>

        <div
            class="px-4 py-3 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 overflow-hidden">
            <span class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                PÁGINA {{ currentPage }} DE {{ Math.ceil(total / pageSize) || 1 }}
            </span>
            <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
                :total="total" layout="total, sizes, prev, pager, next" background
                @size-change="$emit('update:pageSize', $event)" @current-change="$emit('update:currentPage', $event)" />
        </div>

    </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, UserFilled, Notebook, DocumentDelete, OfficeBuilding } from '@element-plus/icons-vue';
import type { ITicket } from '../../domain/entities/Ticket';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';

// Props necessárias para o funcionamento da paginação e lista
defineProps<{
    tickets: ITicket[];
    total: number;
    currentPage: number;
    pageSize: number;
}>();

defineEmits<{
    (e: 'view', ticket: ITicket): void;
    (e: 'edit', ticket: ITicket): void;
    (e: 'delete', id: string): void;
    (e: 'convertToKb', ticket: ITicket): void;
    (e: 'update:currentPage', page: number): void;
    (e: 'update:pageSize', size: number): void;
}>();

const kanbanStore = useKanbanStore();

  const getStatusType = (ticket: any) => {
    const status = ticket.status ? ticket.status.toLowerCase() : '';
    const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns) || kanbanStore.columns || [];
    
    // Se temos o kanbanColumnId, tentamos pegar o status mapeado na coluna para a cor
    if (ticket.kanbanColumnId) {
      const col = allCols.find((c: any) => String(c.id) === String(ticket.kanbanColumnId));
      if (col && col.ticketStatus) {
        const s = col.ticketStatus.toLowerCase();
        if (s === 'open') return 'warning';
        if (s === 'in_progress') return 'primary';
        if (s === 'resolved' || s === 'done') return 'success';
        if (s === 'closed') return 'info';
        if (s === 'pending_approval') return 'danger';
      }
    }

    const map: Record<string, string> = {
        'open': 'warning',
        'in_progress': 'primary',
        'resolved': 'success',
        'done': 'success',
        'closed': 'info',
        'pending_approval': 'danger'
    };
    return map[status] || 'info';
  };

  const getStatusDotClass = (ticket: any) => {
    const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns) || kanbanStore.columns || [];
    // Prioriza o kanbanColumnId para achar a cor exata da coluna
    if (ticket.kanbanColumnId) {
      const col = allCols.find((c: any) => String(c.id) === String(ticket.kanbanColumnId));
      if (col && col.color) return col.color.split(' ')[0] || 'bg-slate-400';
    }
    // Fallback: procura pela coluna com o ticketStatus igual no board específico
    if (ticket.boardId) {
      const boardCols = kanbanStore.boards?.find((b: any) => b.id === ticket.boardId)?.columns || [];
      const col = boardCols.find((c: any) => c.ticketStatus?.toLowerCase() === ticket.status?.toLowerCase());
      if (col && col.color) return col.color.split(' ')[0] || 'bg-slate-400';
    }
    // Fallback pelo active board
    const activeCols = kanbanStore.columns || [];
    const activeCol = activeCols.find((c: any) => c.ticketStatus?.toLowerCase() === ticket.status?.toLowerCase());
    if (activeCol && activeCol.color) return activeCol.color.split(' ')[0] || 'bg-slate-400';

    // Fallback geral nas colunas
    const col = allCols.find((c: any) => c.ticketStatus?.toLowerCase() === ticket.status?.toLowerCase());
    if (col && col.color) return col.color.split(' ')[0] || 'bg-slate-400';

    // Fallback absoluto pelo status enum
    const map: Record<string, string> = {
        'open': 'bg-yellow-400',
        'in_progress': 'bg-blue-500',
        'resolved': 'bg-green-500',
        'done': 'bg-green-600',
        'closed': 'bg-slate-400',
        'pending_approval': 'bg-red-500'
    };
    return map[ticket.status] || 'bg-slate-400';
  };

const getPriorityDotClass = (priority: string) => {
    const map: Record<string, string> = {
        'low': 'bg-blue-400',
        'medium': 'bg-blue-600',
        'high': 'bg-orange-500',
        'urgent': 'bg-red-500'
    };
    return map[priority] || 'bg-slate-400';
};

const getPriorityTextClass = (priority: string) => {
    const map: Record<string, string> = {
        'low': 'text-blue-600',
        'medium': 'text-blue-800',
        'high': 'text-orange-600',
        'urgent': 'text-red-600'
    };
    return map[priority] || 'text-slate-600';
};

  const getStatusLabel = (ticket: any) => {
    const allCols = kanbanStore.boards?.flatMap((b: any) => b.columns) || kanbanStore.columns || [];
    // Prioriza o kanbanColumnId para achar o título exato da coluna
    if (ticket.kanbanColumnId) {
      const col = allCols.find((c: any) => String(c.id) === String(ticket.kanbanColumnId));
      if (col && col.title) return col.title;
    }
    // Fallback: procura pela coluna com o ticketStatus igual no board específico
    if (ticket.boardId) {
      const boardCols = kanbanStore.boards?.find((b: any) => b.id === ticket.boardId)?.columns || [];
      const col = boardCols.find((c: any) => c.ticketStatus?.toLowerCase() === ticket.status?.toLowerCase());
      if (col && col.title) return col.title;
    }
    // Fallback pelo active board
    const activeCols = kanbanStore.columns || [];
    const activeCol = activeCols.find((c: any) => c.ticketStatus?.toLowerCase() === ticket.status?.toLowerCase());
    if (activeCol && activeCol.title) return activeCol.title;

    // Fallback geral nas colunas
    const col = allCols.find((c: any) => c.ticketStatus?.toLowerCase() === ticket.status?.toLowerCase());
    if (col && col.title) return col.title;

    const s = String(ticket.status).toLowerCase();
    const map: Record<string, string> = {
        'open': 'Pendente',
        'in_progress': 'A Fazer',
        'waiting': 'Análise',
        'resolved': 'Resolvido',
        'closed': 'Finalizado',
        'pending_approval': 'Aprovação'
    };
    return map[s] || ticket.status;
  };

const getPriorityType = (priority: string) => {
    const map: Record<string, string> = {
        'low': 'info', 'medium': 'primary', 'high': 'warning', 'urgent': 'danger'
    };
    return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = {
        'low': 'Baixa', 'medium': 'Média', 'high': 'Alta', 'urgent': 'Urgente'
    };
    return map[priority] || priority;
};

const getCustomerLabel = (customer: any) => {
  if (!customer) return '';
  return customer.tradeName || customer.companyName || customer.name || '';
};

const formatDate = (date: string | Date | undefined): string => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};
</script>

<style scoped>
:deep(.el-table__inner-wrapper::before) {
    display: none;
}

:deep(.el-table th.el-table__cell) {
    background-color: #f8fafc;
    color: #64748b;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 900;
    padding: 8px 0;
}

/* Garante que o corpo da tabela use o espaço total para centrar o Empty State */
:deep(.el-table__body-wrapper) {
    height: 100%;
    overflow-y: auto;
}

:deep(.el-table__empty-block) {
    height: 100% !important;
    min-height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Destaque visual na coluna de numeração lateral */
:deep(.el-table__row td:first-child) {
    background-color: #fcfcfd;
    border-right: 1px solid #f1f5f9;
}

/* Padronização dos botões de paginação (Azul igual ao Customer) */
:deep(.el-pagination.is-background .el-pager li.is-active) {
    background-color: #2563eb !important;
}
</style>
