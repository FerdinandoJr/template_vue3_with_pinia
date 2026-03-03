<template>
  <div class="flex flex-col gap-6 h-full p-6">
    <div class="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100 shrink-0">
      <div class="relative flex-1 max-w-md">
        <el-input v-model="searchQuery" @input="handleSearch" placeholder="Pesquisar clientes ou empresas..."
          size="large" clearable>
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <el-button type="primary" size="large" @click="openCreateModal" class="!rounded-xl !font-bold">
        <el-icon class="mr-2">
          <Plus />
        </el-icon>
        Novo Cliente
      </el-button>
    </div>

    <ClientStats :total="total" />

    <div v-if="loading" class="flex justify-center p-10 flex-1">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <ClientTable v-else :clients="items" @select="goToDetails" @edit="openEditModal" @delete="promptDeleteCustomer" />

    <CustomerFormModal v-if="isFormModalOpen" :is-open="isFormModalOpen" :customer-data="customerToEdit"
      @close="isFormModalOpen = false" @save="handleSaveCustomer" />

    <el-dialog v-model="isDeleteModalOpen" title="Excluir Empresa?" width="400px" align-center>
      <div class="text-center">
        <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <el-icon :size="32">
            <Delete />
          </el-icon>
        </div>
        <p class="text-slate-500 mb-4">
          Tem certeza que deseja apagar permanentemente este cliente e todos os contatos vinculados a ele?
        </p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-center">
          <el-button @click="isDeleteModalOpen = false">Cancelar</el-button>
          <el-button type="danger" @click="confirmDeleteCustomer">Sim, Excluir</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { useCustomerStore } from '../store/customer.store'
import type { ICustomer } from '../../domain/entities/customer'
import ClientStats from '../components/CustomerStats.vue'
import ClientTable from '../components/CustomerTable.vue'
import CustomerFormModal from '../components/CustomerFormModal.vue'

const store = useCustomerStore()
const router = useRouter()
const { items, total, loading } = storeToRefs(store)

const isFormModalOpen = ref(false)
const customerToEdit = ref<Partial<ICustomer> | null>(null)
const isDeleteModalOpen = ref(false)
const customerUuidToDelete = ref<string | null>(null)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const handleSearch = (value: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.setQuery(value)
  }, 300)
}

const goToDetails = (uuid: string) => {
  router.push(`/clientes/${uuid}`)
}

const openCreateModal = () => {
  customerToEdit.value = null
  isFormModalOpen.value = true
}

const openEditModal = (customer: ICustomer) => {
  customerToEdit.value = { ...customer }
  isFormModalOpen.value = true
}

const handleSaveCustomer = async (data: any) => {
  if (customerToEdit.value && customerToEdit.value.uuid) {
    await store.updateCustomer(customerToEdit.value.uuid, data)
  } else {
    await store.createCustomer(data)
  }
  isFormModalOpen.value = false
  store.fetch()
}

const promptDeleteCustomer = (uuid: string) => {
  customerUuidToDelete.value = uuid
  isDeleteModalOpen.value = true
}

const confirmDeleteCustomer = async () => {
  if (customerUuidToDelete.value) {
    await store.deleteCustomer(customerUuidToDelete.value)
    store.fetch()
  }
  isDeleteModalOpen.value = false
  customerUuidToDelete.value = null
}

onMounted(() => {
  store.fetch()
})
</script>