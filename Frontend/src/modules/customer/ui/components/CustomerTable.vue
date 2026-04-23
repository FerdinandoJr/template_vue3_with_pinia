<template>
  <div
    class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full flex-1 min-h-0">

    <div class="flex-1 overflow-y-auto flex flex-col relative min-h-0 bg-white">
      <el-table :data="clients" style="width: 100%; height: 100%; position: absolute; inset: 0;"
        @row-click="handleRowClick" row-class-name="cursor-pointer hover:bg-slate-50 transition-colors"
        highlight-current-row>
        <el-table-column label="Cliente / Empresa" min-width="250">
          <template #default="scope">
            <div class="flex items-center gap-4 py-2">
              <el-avatar :size="36" class="!bg-blue-50 !text-blue-600 !border !border-blue-100 !font-black">
                {{ scope.row.avatar }}
              </el-avatar>
              <div>
                <p class="font-bold text-slate-800 leading-tight text-sm">
                  {{ scope.row.tradeName || scope.row.companyName || scope.row.name || '-' }}
                </p>
                <p class="text-[10px] text-slate-500 font-bold mt-0.5">
                  {{ scope.row.document || 'Sem NIF/CNPJ' }}
                </p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Contato Responsável" min-width="200">
          <template #default="scope">
            <p class="font-bold text-slate-700 text-sm">{{ scope.row.responsibleName || scope.row.name || '-' }}</p>
            <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
              <el-icon>
                <Phone />
              </el-icon>
              <span>
                {{ formatPhone(scope.row.phone) || scope.row.email || 'Sem contato' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Origem" width="130">
          <template #default="scope">
            <el-tag type="info" effect="plain" round size="small" class="!text-[10px]">
              {{ scope.row.source || 'Sistema' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Estado" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" effect="light" round size="small">
              {{ scope.row.status === 'active' ? 'Ativo' : 'Inativo' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Ações" width="120" align="right">
          <template #default="scope">
            <div @click.stop class="flex justify-end gap-2">
              <el-button type="primary" circle plain size="small" @click="handleEditClick(scope.row)">
                <el-icon>
                  <Edit />
                </el-icon>
              </el-button>
              <el-button type="danger" circle plain size="small" @click="handleDeleteClick(scope.row)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="flex flex-col items-center justify-center h-full text-slate-500 w-full py-10">
            <el-icon :size="40" class="mb-2 text-slate-300">
              <FolderDelete />
            </el-icon>
            <p class="text-sm font-medium">Nenhum cliente encontrado no sistema.</p>
          </div>
        </template>
      </el-table>
    </div>

    <div
      class="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
      <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Pág. {{ currentPage }} de {{ Math.ceil(total / pageSize) || 1 }}
      </span>
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total"
        layout="sizes, prev, pager, next" size="small" background @size-change="$emit('update:pageSize', $event)"
        @current-change="$emit('update:currentPage', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Delete, Phone, FolderDelete } from '@element-plus/icons-vue'
import type { ICustomer } from '../../domain/entities/customer'

defineProps<{
  clients: ICustomer[];
  total: number;
  currentPage: number;
  pageSize: number;
}>()

const emit = defineEmits(['select', 'edit', 'delete', 'update:currentPage', 'update:pageSize'])

const handleRowClick = (row: ICustomer) => {
  emit('select', row.id)
}

const handleEditClick = (row: ICustomer) => {
  emit('edit', row)
}

const handleDeleteClick = (row: ICustomer) => {
  emit('delete', row)
}

const formatPhone = (phone?: string) => {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
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
  font-weight: 800;
  padding: 8px 0;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
  height: 100%;
}

:deep(.el-table__empty-block) {
  height: 100% !important;
  min-height: 200px;
}

:deep(.el-pagination.is-background .btn-next),
:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .el-pager li) {
  margin: 0 2px;
  min-width: 28px;
  height: 28px;
}
</style>