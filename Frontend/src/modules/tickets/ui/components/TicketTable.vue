<template>
    <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col" style="height: 100%; min-height: 300px; max-height: 100%;">

        <div class="flex-1 overflow-y-auto bg-white">
            <el-table :data="tickets" style="width: 100%;" class="custom-table" highlight-current-row>

                <el-table-column type="index" label="#" width="50" align="center"
                    class-name="font-bold text-slate-400 text-[10px]" />

                <el-table-column prop="id" label="ID" width="85" align="center">
                    <template #default="scope">
                        <span class="font-bold text-slate-800">#{{ scope.row.id }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="title" label="Título do Ticket" min-width="230">
                    <template #default="scope">
                        <span class="font-bold text-slate-800 text-sm">{{ scope.row.title }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="customer" label="Cliente" min-width="180">
                    <template #default="scope">
                        <span class="font-medium text-slate-600 text-sm">{{ scope.row.customer }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="assigneeName" label="Responsável" min-width="150">
                    <template #default="scope">
                        <span v-if="scope.row.assigneeName"
                            class="font-medium text-blue-600 flex items-center gap-1.5 text-sm">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            {{ scope.row.assigneeName }}
                        </span>
                        <span v-else class="text-slate-400 italic text-[11px]">Não atribuído</span>
                    </template>
                </el-table-column>

                <el-table-column prop="status" label="Status" width="130">
                    <template #default="scope">
                        <el-tag :type="getStatusType(scope.row.status)" effect="light" round size="small"
                            class="font-bold">
                            {{ getStatusLabel(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="priority" label="Prioridade" width="110">
                    <template #default="scope">
                        <el-tag :type="getPriorityType(scope.row.priority)" effect="plain" size="small">
                            {{ getPriorityLabel(scope.row.priority) }}
                        </el-tag>
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
                        <el-icon :size="48" class="mb-3 opacity-20 text-slate-300">
                            <DocumentDelete />
                        </el-icon>
                        <p class="text-sm font-semibold tracking-tight">Nenhum cliente encontrado no sistema.</p>
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
import { View, Edit, Delete, UserFilled, Notebook, DocumentDelete } from '@element-plus/icons-vue';
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
    (e: 'delete', id: number): void;
    (e: 'convertToKb', ticket: ITicket): void;
    (e: 'update:currentPage', page: number): void;
    (e: 'update:pageSize', size: number): void;
}>();

const kanbanStore = useKanbanStore();

const getStatusType = (status: string) => {
    const map: Record<string, string> = {
        'open': 'warning',
        'in-progress': 'primary',
        'resolved': 'success',
        'done': 'success',
        'internal': 'info',
        'pending_approval': 'danger'
    };
    return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
    const col = kanbanStore.columns?.find((c: any) => String(c.id) === String(status));
    if (col && col.title) return col.title;
    return status;
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