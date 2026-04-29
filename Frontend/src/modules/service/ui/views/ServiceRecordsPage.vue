<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Atendimentos</h1>
        <p class="text-sm text-slate-500">Gerencie os atendimentos da sua equipe</p>
      </div>
      <el-button type="primary" @click="showCreateModal = true">
        <el-icon class="mr-1"><Plus /></el-icon>
        Novo Atendimento
      </el-button>
    </div>

    <el-card shadow="never" class="mb-6">
      <div class="flex gap-4">
        <el-input v-model="filters.search" placeholder="Buscar..." clearable @keyup.enter="handleSearch">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filters.status" placeholder="Status" clearable @change="handleSearch">
          <el-option label="Aberto" value="open" />
          <el-option label="Em Andamento" value="in_progress" />
          <el-option label="Aguardando" value="waiting" />
          <el-option label="Resolvido" value="resolved" />
          <el-option label="Fechado" value="closed" />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="store.items" v-loading="store.loading" stripe>
        <el-table-column prop="serviceNumber" label="Nº" width="100" />
        <el-table-column prop="subject" label="Assunto" min-width="200" />
        <el-table-column prop="customer.name" label="Cliente" width="150" />
        <el-table-column prop="channel" label="Canal" width="100">
          <template #default="{ row }">
            <el-tag :type="getChannelType(row.channel)" size="small">
              {{ getChannelLabel(row.channel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="attendant.name" label="Atendente" width="150" />
        <el-table-column prop="createdAt" label="Criado em" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="" width="80" fixed="right">
          <template #default="{ row }">
            <el-dropdown @command="(cmd) => handleCommand(cmd, row)">
              <el-button text circle>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view">
                    <el-icon><View /></el-icon> Visualizar
                  </el-dropdown-item>
                  <el-dropdown-item command="edit">
                    <el-icon><Edit /></el-icon> Editar
                  </el-dropdown-item>
                  <el-dropdown-item command="ticket" divided>
                    <el-icon><Tickets /></el-icon> Criar Ticket
                  </el-dropdown-item>
                  <el-dropdown-item command="delete">
                    <el-icon><Delete /></el-icon>
                    <span class="text-red-500">Excluir</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="store.currentPage"
          :page-size="store.pageSize"
          :total="store.total"
          layout="prev, pager, next"
          @current-change="store.setPage"
        />
      </div>
    </el-card>

    <el-dialog v-model="showCreateModal" title="Novo Atendimento" width="500px">
      <el-form :model="form" label-position="top">
        <el-form-item label="Assunto">
          <el-input v-model="form.subject" placeholder="Digite o assunto" />
        </el-form-item>
        <el-form-item label="Descrição">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Descreva o atendimento" />
        </el-form-item>
        <el-form-item label="Canal">
          <el-select v-model="form.channel" placeholder="Selecione o canal">
            <el-option label="Chat" value="chat" />
            <el-option label="WhatsApp" value="whatsapp" />
            <el-option label="Email" value="email" />
            <el-option label="Telefone" value="phone" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateModal = false">Cancelar</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">Criar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useServiceRecordsStore } from '../store/service-records.store'
import type { IServiceRecord } from '../../data/service-records.service'
import { Plus, Search, MoreFilled, View, Edit, Delete, Tickets } from '@element-plus/icons-vue'

const router = useRouter()
const store = useServiceRecordsStore()

const showCreateModal = ref(false)
const creating = ref(false)
const filters = reactive({
  search: '',
  status: ''
})

const form = reactive({
  subject: '',
  description: '',
  channel: 'chat'
})

onMounted(() => {
  store.fetch()
})

const handleSearch = () => {
  store.applyFilters({
    search: filters.search || undefined,
    status: filters.status || undefined
  })
}

const handleCreate = async () => {
  if (!form.subject) {
    ElMessage.warning('Preencha o assunto')
    return
  }
  creating.value = true
  try {
    await store.create(form)
    showCreateModal.value = false
    ElMessage.success('Atendimento criado com sucesso!')
    form.subject = ''
    form.description = ''
    form.channel = 'chat'
  } catch (error) {
    ElMessage.error('Erro ao criar atendimento')
  } finally {
    creating.value = false
  }
}

const handleCommand = async (cmd: string, item: IServiceRecord) => {
  if (cmd === 'view' || cmd === 'edit') {
    showCreateModal.value = true
  } else if (cmd === 'delete') {
    ElMessageBox.confirm('Tem certeza que deseja excluir?', 'Atenção', {
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }).then(async () => {
      await store.delete(item.id!)
      ElMessage.success('Excluído com sucesso!')
    }).catch(() => {})
  } else if (cmd === 'ticket') {
    router.push({ path: '/tickets/new', query: { serviceRecordId: item.id } })
  }
}

const getChannelType = (channel: string) => {
  const types: Record<string, string> = {
    chat: '', whatsapp: 'success', email: 'warning', phone: 'info'
  }
  return types[channel] || ''
}

const getChannelLabel = (channel: string) => {
  const labels: Record<string, string> = {
    chat: 'Chat', whatsapp: 'WhatsApp', email: 'Email', phone: 'Telefone'
  }
  return labels[channel] || channel
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    open: '', in_progress: 'warning', waiting: 'info', resolved: 'success', closed: 'info'
  }
  return types[status] || ''
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Aberto', in_progress: 'Em Andamento', waiting: 'Aguardando', resolved: 'Resolvido', closed: 'Fechado'
  }
  return labels[status] || status
}

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}
</script>