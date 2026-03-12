<template>
  <div
    class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[calc(100vh-300px)]">
    <el-table :data="clients" style="width: 100%; height: 100%;" @row-click="handleRowClick"
      row-class-name="cursor-pointer hover:bg-slate-50 transition-colors" highlight-current-row>
      <el-table-column label="Cliente / Empresa" min-width="250">
        <template #default="scope">
          <div class="flex items-center gap-4 py-2">
            <el-avatar :size="40" class="!bg-blue-50 !text-blue-600 !border !border-blue-100 !font-black">
              {{ scope.row.avatar }}
            </el-avatar>
            <div>
              <p class="font-bold text-slate-800 leading-tight">
                {{ scope.row.tradeName || scope.row.companyName }}
              </p>
              <p class="text-[11px] text-slate-500 font-bold mt-0.5">
                {{ scope.row.document || 'Sem NIF/CNPJ' }}
              </p>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Contacto Responsável" min-width="200">
        <template #default="scope">
          <p class="font-bold text-slate-700">{{ scope.row.name }}</p>
          <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <el-icon>
              <Phone />
            </el-icon>
            <span>
              {{ formatPhone(scope.row.phone) || scope.row.email || 'Sem contacto' }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Origem" width="150">
        <template #default="scope">
          <el-tag type="info" effect="plain" round size="small">
            {{ scope.row.source || 'Sistema' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Estado" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'" effect="light" round>
            {{ scope.row.status === 'active' ? 'Ativo' : 'Inativo' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Ações" width="140" align="right">
        <template #default="scope">
          <div @click.stop class="flex justify-end gap-2">
            <el-button type="primary" circle plain size="small" @click="$emit('edit', scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
            </el-button>
            <el-button type="danger" circle plain size="small" @click="$emit('delete', scope.row.uuid)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>

      <template #empty>
        <div class="py-12 text-center text-slate-500">
          <el-icon :size="40" class="mb-2 block mx-auto">
            <FolderDelete />
          </el-icon>
          <p>Nenhum cliente encontrado no sistema.</p>
        </div>
      </template>
    </el-table>

    <div
      class="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
      <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">
        Página {{ currentPage }} de {{ Math.ceil(total / pageSize) || 1 }}
      </span>

      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total"
        layout="sizes, prev, pager, next" background @size-change="$emit('update:pageSize', $event)"
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
  emit('select', row.uuid)
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
  font-weight: 900;
  letter-spacing: 0.05em;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #2563eb;
  font-weight: bold;
}
</style>