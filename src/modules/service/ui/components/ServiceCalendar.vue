<template>
    <div class="flex flex-col h-full bg-slate-50 p-4 md:p-6 w-full overflow-hidden">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">Atendimentos</h1>
                <p class="text-sm text-slate-500 mt-1">Gerencie os atendimentos e serviços do sistema</p>
            </div>
            <div class="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <el-radio-group v-model="viewMode" size="default">
                    <el-radio-button label="list">
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <List />
                            </el-icon>
                            <span class="hidden sm:inline">Lista</span>
                        </div>
                    </el-radio-button>
                    <el-radio-button label="calendar">
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <Calendar />
                            </el-icon>
                            <span class="hidden sm:inline">Calendário</span>
                        </div>
                    </el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="large" @click="handleCreate" class="flex-1 sm:flex-none">
                    <el-icon class="mr-2">
                        <Plus />
                    </el-icon> Novo Atendimento
                </el-button>
            </div>
        </div>

        <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full relative">
            <div v-if="viewMode === 'list'" class="h-full flex flex-col p-4 w-full custom-scroll-x">
                <div class="min-w-[800px] h-full overflow-y-auto">
                    <el-table :data="serviceStore.services" v-loading="serviceStore.loading" style="width: 100%"
                        height="100%" stripe>
                        <el-table-column prop="protocol" label="Protocolo" width="160" />
                        <el-table-column prop="customerName" label="Cliente" min-width="200" />
                        <el-table-column prop="createdAt" label="Data/Hora" width="180" />
                        <el-table-column prop="status" label="Status" width="140">
                            <template #default="{ row }">
                                <el-tag :type="getStatusType(row.status)">
                                    {{ getStatusLabel(row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="Ações" width="120" fixed="right" align="center">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="handleEdit(row)"> Detalhes </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <div v-else-if="viewMode === 'calendar'" class="h-full overflow-x-auto custom-scroll-x w-full">
                <div class="min-w-[800px] h-full">
                    <ServiceCalendar @open-details="handleEdit" @create-service="handleCreateWithDate" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { List, Calendar, Plus } from '@element-plus/icons-vue'
import { useServiceStore } from '../store/service.store'
import ServiceCalendar from '../components/ServiceCalendar.vue'

const serviceStore = useServiceStore()
const viewMode = ref<'list' | 'calendar'>('list')

const getStatusType = (status: string) => {
    const types: Record<string, string> = { waiting: 'warning', in_progress: 'primary', finished: 'success' }
    return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { waiting: 'Aguardando', in_progress: 'Em Andamento', finished: 'Concluído' }
    return labels[status] || status
}

const handleCreate = () => {
    console.log('Abrir modal de Novo Atendimento')
}

const handleCreateWithDate = (dateStr: string) => {
    console.log('Abrir modal preenchendo a data/hora:', dateStr)
}

const handleEdit = (service: any) => {
    console.log('Abrir modal de Edição/Detalhes para:', service.id)
}

onMounted(() => {
    serviceStore.fetchServices()
})
</script>

<style scoped>
:deep(.el-radio-button__inner) {
    display: flex;
    align-items: center;
    justify-content: center;
}

.custom-scroll-x {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
}
</style>