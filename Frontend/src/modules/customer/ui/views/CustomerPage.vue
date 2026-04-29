<template>
  <div class="flex flex-col gap-4 h-full animate-fade-in overflow-hidden">
    
    <div class="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 shrink-0">
      <div class="relative flex-1 max-w-md">
        <el-input v-model="searchQuery" @input="handleSearch" placeholder="Pesquisar clientes ou empresas..." size="large" clearable >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div class="flex gap-2">
        <el-button type="info" plain size="large" class="!px-3 !rounded-xl" @click="isSourceModalOpen = true" title="Gerir Origens">
          <el-icon>
            <Setting />
          </el-icon>
        </el-button>
        <el-button type="primary" size="large" @click="openCreateModal" class="!rounded-xl !font-bold">
          <el-icon class="mr-2">
            <Plus />
          </el-icon>
          Novo Cliente
        </el-button>
      </div>
    </div>

    <CustomerStats :total="total" class="shrink-0" />

    <div v-if="loading && items.length === 0" class="flex justify-center p-10 flex-1 items-center min-h-0">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    
    <div v-else class="flex-1 min-h-0 overflow-y-auto pb-2">
      <CustomerTable 
        :clients="items" 
        :total="filteredTotal || total" 
        :current-page="store.currentPage || 1" 
        :page-size="store.pageSize || 10" 
        @update:current-page="store.setPage" 
        @update:page-size="store.setPageSize" 
        @select="goToDetails" 
        @edit="openEditModal" 
        @delete="promptDeleteCustomer" 
      />
    </div>

    <Teleport to="body">
      <CustomerFormModal v-if="isFormModalOpen" :key="modalKey" :is-open="isFormModalOpen" :customer-data="customerToEdit" @close="isFormModalOpen = false" @save="handleSaveCustomer" />
      <CustomerSourceSettingsModal v-if="isSourceModalOpen" :is-open="isSourceModalOpen" @close="isSourceModalOpen = false" />
      
      <el-dialog v-model="isDeleteModalOpen" :title="`Excluir ${customerToDeleteName}?`" width="450px" align-center class="delete-dialog">
        <div class="text-center py-4">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
            <el-icon :size="40">
              <Delete />
            </el-icon>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Excluir Cliente?</h3>
          <p class="text-slate-500 mb-2">
            Você está prestes a excluir permanentemente:
          </p>
          <p class="text-lg font-bold text-slate-700 mb-4">{{ customerToDeleteName }}</p>
          <p class="text-sm text-red-400">
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <template #footer>
          <div class="flex gap-3 justify-center">
            <el-button size="large" @click="isDeleteModalOpen = false" class="!px-8">
              Cancelar
            </el-button>
            <el-button type="danger" size="large" @click="confirmDeleteCustomer" class="!px-8 !font-bold">
              <el-icon class="mr-1"><Delete /></el-icon>
              Sim, Excluir
            </el-button>
          </div>
        </template>
      </el-dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Search, Plus, Delete, Setting } from '@element-plus/icons-vue'
import { useCustomerStore } from '../store/customer.store'
import CustomerStats from '../components/CustomerStats.vue'
import CustomerTable from '../components/CustomerTable.vue'
import CustomerFormModal from '../components/CustomerFormModal.vue'
import CustomerSourceSettingsModal from '../components/CustomerSourceSettingsModal.vue'

const store = useCustomerStore()
const router = useRouter()
const { items, total, filteredTotal, loading } = storeToRefs(store)

const isFormModalOpen = ref(false)
const isSourceModalOpen = ref(false)
const customerToEdit = ref<any>(null)
const modalKey = ref(0)

const isDeleteModalOpen = ref(false)
const customerUuidToDelete = ref<string | null>(null)
const customerToDeleteName = ref<string>('')

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const handleSearch = (value: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.setQuery(value)
  }, 150)
}

const goToDetails = (id: string) => {
  router.push(`/customer/${id}`)
}

const openCreateModal = () => {
  customerToEdit.value = null
  modalKey.value++
  isFormModalOpen.value = true
}

const openEditModal = (customer: any) => {
  customerToEdit.value = { ...customer }
  modalKey.value++
  isFormModalOpen.value = true
}

const handleSaveCustomer = async (data: any) => {
  if (customerToEdit.value && customerToEdit.value.id) {
    await store.updateCustomer(customerToEdit.value.id, data)
  } else {
    await store.createCustomer(data)
  }
  isFormModalOpen.value = false
}

const promptDeleteCustomer = (customer: any) => {
  customerUuidToDelete.value = customer.id
  customerToDeleteName.value = customer.tradeName || customer.companyName || customer.name || 'este cliente'
  isDeleteModalOpen.value = true
}

const confirmDeleteCustomer = async () => {
  if (customerUuidToDelete.value) {
    await store.deleteCustomer(customerUuidToDelete.value)
  }
  isDeleteModalOpen.value = false
  customerUuidToDelete.value = null
}

onMounted(() => {
  store.fetch()
})
</script>