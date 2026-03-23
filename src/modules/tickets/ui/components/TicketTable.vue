<template>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        <el-table :data="tickets" style="width: 100%; height: 100%;" class="custom-table" highlight-current-row>
            <el-table-column prop="id" label="ID" width="100" align="center">
                <template #default="scope">
                    <span class="font-bold text-slate-800">#{{ scope.row.id }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="title" label="Título do Ticket" min-width="250">
                <template #default="scope">
                    <span class="font-bold text-slate-800">{{ scope.row.title }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="customer" label="Cliente" min-width="200">
                <template #default="scope">
                    <span class="font-medium text-slate-600">{{ scope.row.customer }}</span>
                </template>
            </el-table-column>

            <el-table-column prop="assigneeName" label="Responsável" min-width="150">
                <template #default="scope">
                    <span v-if="scope.row.assigneeName" class="font-medium text-blue-600 flex items-center gap-1.5">
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        {{ scope.row.assigneeName }}
                    </span>
                    <span v-else class="text-slate-400 italic text-xs">Não atribuído</span>
                </template>
            </el-table-column>

            <el-table-column prop="status" label="Status" width="150">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)" effect="light" round>
                        {{ getStatusLabel(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="priority" label="Prioridade" width="130">
                <template #default="scope">
                    <el-tag :type="getPriorityType(scope.row.priority)" effect="plain" size="small">
                        {{ getPriorityLabel(scope.row.priority) }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="Ações" width="160" align="right">
                <template #default="scope">
                    <div class="flex justify-end gap-2 pr-2">
                        <el-button type="primary" circle plain size="small" @click="$emit('view', scope.row)"
                            title="Visualizar">
                            <el-icon>
                                <View />
                            </el-icon>
                        </el-button>
                        <el-button type="primary" circle plain size="small" @click="$emit('edit', scope.row)"
                            title="Editar">
                            <el-icon>
                                <Edit />
                            </el-icon>
                        </el-button>
                        <el-popconfirm title="Tem certeza que deseja excluir?" confirm-button-text="Sim"
                            cancel-button-text="Não" @confirm="$emit('delete', scope.row.id)">
                            <template #reference>
                                <el-button type="danger" circle plain size="small" title="Excluir">
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
                <div class="py-12 text-center text-slate-500">
                    <p>Nenhum ticket encontrado.</p>
                </div>
            </template>
        </el-table>
    </div>
</template>

<script setup lang="ts">
import { View, Edit, Delete, UserFilled } from '@element-plus/icons-vue';
import type { ITicket } from '../../domain/entities/Ticket';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';

defineProps<{
    tickets: ITicket[];
}>();

defineEmits<{
    (e: 'view', ticket: ITicket): void;
    (e: 'edit', ticket: ITicket): void;
    (e: 'delete', id: number): void;
}>();

const kanbanStore = useKanbanStore();

const getStatusType = (status: string) => {
    const map: Record<string, string> = {
        'open': 'warning',
        'in-progress': 'primary',
        'in_progress': 'primary',
        'waiting': 'warning',
        'aguardando': 'warning',
        'resolved': 'success',
        'done': 'success'
    };
    return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
    const col = kanbanStore.columns?.find((c: any) => String(c.id) === String(status));
    if (col && col.title) return col.title;

    const map: Record<string, string> = {
        'open': 'Aberto',
        'in-progress': 'Em Andamento',
        'in_progress': 'Em Andamento',
        'waiting': 'Aguardando',
        'aguardando': 'Aguardando',
        'resolved': 'Resolvido',
        'done': 'Finalizado'
    };
    return map[status] || status;
};

const getPriorityType = (priority: string) => {
    const map: Record<string, string> = {
        'low': 'info',
        'medium': 'primary',
        'high': 'warning',
        'urgent': 'danger'
    };
    return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = {
        'low': 'Baixa',
        'medium': 'Média',
        'high': 'Alta',
        'urgent': 'Urgente'
    };
    return map[priority] || priority;
};
</script>

<style scoped>
:deep(.el-table th.el-table__cell) {
    background-color: #f8fafc;
    color: #64748b;
    text-transform: uppercase;
    font-size: 11px;
    font-weight: 800;
}
</style>