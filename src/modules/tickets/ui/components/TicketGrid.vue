<template>
    <div v-if="tickets.length === 0"
        class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <el-icon class="text-slate-300 text-6xl mb-4">
            <DocumentDelete />
        </el-icon>
        <p class="text-slate-500 font-medium">Nenhum ticket encontrado.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
        <el-card v-for="ticket in tickets" :key="ticket.id"
            class="ticket-card !border-slate-200 !rounded-2xl hover:shadow-md transition-shadow duration-200"
            shadow="never">
            <div class="flex justify-between items-start mb-3">
                <div class="flex flex-col pr-4">
                    <span class="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        Ticket #{{ ticket.id }}
                    </span>
                    <h3 class="text-base font-bold text-slate-800 leading-tight line-clamp-2" :title="ticket.title">
                        {{ ticket.title }}
                    </h3>
                </div>

                <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, ticket)">
                    <el-button text circle size="small" class="!p-2 -mr-2 text-slate-400 hover:text-blue-600">
                        <el-icon class="text-lg">
                            <MoreFilled />
                        </el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="view">
                                <el-icon>
                                    <View />
                                </el-icon> Visualizar
                            </el-dropdown-item>
                            <el-dropdown-item command="edit">
                                <el-icon>
                                    <Edit />
                                </el-icon> Editar
                            </el-dropdown-item>
                            <el-dropdown-item command="delete" divided class="!text-red-500">
                                <el-icon>
                                    <Delete />
                                </el-icon> Excluir
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

            <div class="flex items-center gap-3 mb-4 mt-2">
                <el-avatar :size="32" class="bg-blue-50 text-blue-600 font-bold text-sm">
                    {{ ticket.customer.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="text-sm font-medium text-slate-600 truncate">{{ ticket.customer }}</span>
            </div>

            <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div class="flex gap-2">
                    <el-tag :type="getStatusType(ticket.status)" size="small" effect="light" round
                        class="!border-none font-semibold">
                        {{ getStatusLabel(ticket.status) }}
                    </el-tag>
                    <el-tag :type="getPriorityType(ticket.priority)" size="small" effect="plain" class="font-semibold">
                        {{ getPriorityLabel(ticket.priority) }}
                    </el-tag>
                </div>
                <span class="text-xs text-slate-400 font-medium">
                    {{ formatDate(ticket.createdAt) }}
                </span>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { DocumentDelete, MoreFilled, View, Edit, Delete } from '@element-plus/icons-vue';
import type { ITicket } from '../../domain/entities/Ticket';
import { ElMessageBox } from 'element-plus';

const props = defineProps<{
    tickets: ITicket[];
}>();

const emit = defineEmits<{
    (e: 'view', ticket: ITicket): void;
    (e: 'edit', ticket: ITicket): void;
    (e: 'delete', id: number): void;
}>();

const handleCommand = (command: string, ticket: ITicket) => {
    if (command === 'view') emit('view', ticket);
    if (command === 'edit') emit('edit', ticket);
    if (command === 'delete') {
        ElMessageBox.confirm('Tem certeza que deseja excluir este ticket?', 'Atenção', {
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            type: 'warning',
            confirmButtonClass: 'el-button--danger'
        }).then(() => {
            emit('delete', ticket.id);
        }).catch(() => { });
    }
};

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const getStatusType = (status: string) => {
    const map: Record<string, string> = { 'open': 'warning', 'in-progress': 'primary', 'resolved': 'success' };
    return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { 'open': 'Aberto', 'in-progress': 'Em Andamento', 'resolved': 'Resolvido' };
    return map[status] || status;
};

const getPriorityType = (priority: string) => {
    const map: Record<string, string> = { 'low': 'info', 'medium': 'primary', 'high': 'warning', 'urgent': 'danger' };
    return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
    const map: Record<string, string> = { 'low': 'Baixa', 'medium': 'Média', 'high': 'Alta', 'urgent': 'Urgente' };
    return map[priority] || priority;
};
</script>

<style scoped>
:deep(.el-card__body) {
    padding: 20px;
}
</style>