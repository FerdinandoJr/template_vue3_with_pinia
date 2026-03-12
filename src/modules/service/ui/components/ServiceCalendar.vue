<template>
    <div class="flex flex-col h-full bg-slate-50 p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">Atendimentos</h1>
                <p class="text-sm text-slate-500 mt-1">Gerencie os atendimentos e serviços do sistema</p>
            </div>

            <div class="flex items-center gap-4">
                <el-radio-group v-model="viewMode" size="default">
                    <el-radio-button label="list">
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <List />
                            </el-icon>
                            <span>Lista</span>
                        </div>
                    </el-radio-button>
                    <el-radio-button label="calendar">
                        <div class="flex items-center gap-2">
                            <el-icon>
                                <Calendar />
                            </el-icon>
                            <span>Calendário</span>
                        </div>
                    </el-radio-button>
                </el-radio-group>

                <el-button type="primary" size="large" @click="handleCreate">
                    <el-icon class="mr-2">
                        <Plus />
                    </el-icon>
                    Novo Atendimento
                </el-button>
            </div>
        </div>

        <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

            <div v-if="viewMode === 'list'" class="h-full flex flex-col p-4">
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
                            <el-button type="primary" link @click="handleEdit(row)">
                                Detalhes
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div v-else-if="viewMode === 'calendar'" class="h-full">
                <ServiceCalendar @open-details="handleEdit" @create-service="handleCreateWithDate" />
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { List, Calendar, Plus } from '@element-plus/icons-vue'

// Importando a Store e o Componente de Calendário
import { useServiceStore } from '../store/service.store'
import ServiceCalendar from '../components/ServiceCalendar.vue'

const serviceStore = useServiceStore()

// Estado para controlar a visualização ativa (Inicia como 'list' por padrão)
const viewMode = ref<'list' | 'calendar'>('list')

// ==========================================
// FUNÇÕES AUXILIARES E DE AÇÃO
// ==========================================

// Função para formatar as tags de status na tabela
const getStatusType = (status: string) => {
    const types: Record<string, string> = {
        waiting: 'warning',
        in_progress: 'primary',
        finished: 'success'
    }
    return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        waiting: 'Aguardando',
        in_progress: 'Em Andamento',
        finished: 'Concluído'
    }
    return labels[status] || status
}

// Funções de clique que você já utiliza no seu projeto
const handleCreate = () => {
    console.log('Abrir modal de Novo Atendimento')
    // Sua lógica para abrir o modal de criação
}

// Quando o usuário clica em um horário em branco no Calendário
const handleCreateWithDate = (dateStr: string) => {
    console.log('Abrir modal preenchendo a data/hora:', dateStr)
    // Sua lógica para abrir o modal, passando a dataStr para o form
}

const handleEdit = (service: any) => {
    console.log('Abrir modal de Edição/Detalhes para:', service.id)
    // Sua lógica para abrir os detalhes ou a edição do Atendimento
}

// Busca os dados ao montar a tela
onMounted(() => {
    // Caso a sua store tenha um método para buscar os services da API
    // serviceStore.fetchServices()
})
</script>

<style scoped>
/* O Element Plus lida bem com a altura (height: 100%), 
   garantimos apenas que os ícones do radio fiquem alinhados */
:deep(.el-radio-button__inner) {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>