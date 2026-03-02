<template>
  <div class="flex flex-col gap-6 h-full">

    <div class="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100 shrink-0">
      <div class="relative flex-1 max-w-md">
        <span class="absolute left-3 top-2.5 text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input @input="handleSearch" type="text" placeholder="Pesquisar clientes ou empresas..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none">
      </div>

      <button @click="openCreateModal"
        class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition flex items-center gap-2">
        <Plus class="w-4 h-4" /> Novo Cliente
      </button>
    </div>

    <ClientStats :total="total" />

    <div v-if="loading" class="flex justify-center p-10 flex-1">
      <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <ClientTable v-else :clients="items" @select="goToDetails" @edit="openEditModal" @delete="promptDeleteCustomer" />

    <Teleport to="body">

      <CustomerFormModal v-if="isFormModalOpen" :is-open="isFormModalOpen" :customer-data="customerToEdit"
        @close="isFormModalOpen = false" @save="handleSaveCustomer" />

      <div v-if="isDeleteModalOpen"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
        <div
          class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
          <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-8 h-8" />
          </div>
          <h3 class="text-center text-xl font-bold text-slate-800 mb-2">Excluir Empresa?</h3>
          <p class="text-center text-sm text-slate-500 mb-8 px-2">Tem certeza que deseja apagar permanentemente este
            cliente e todos os contatos vinculados a ele?</p>
          <div class="flex gap-3">
            <button @click="isDeleteModalOpen = false"
              class="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
            <button @click="confirmDeleteCustomer"
              class="flex-1 px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition-colors">Sim,
              Excluir</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Search, Plus, Trash2 } from 'lucide-vue-next'

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
const isDeleteModalOpen = ref(false);
const customerUuidToDelete = ref<string | null>(null);

let searchTimeout: ReturnType<typeof setTimeout>;
const handleSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
  }, 300);
};

const goToDetails = (uuid: string) => {
  router.push(`/clientes/${uuid}`);
}

const openCreateModal = () => {
  customerToEdit.value = null;
  isFormModalOpen.value = true;
}

const openEditModal = (customer: ICustomer) => {
  customerToEdit.value = { ...customer };
  isFormModalOpen.value = true;
}

const handleSaveCustomer = async (data: any) => {
  if (customerToEdit.value && customerToEdit.value.uuid) {
    if (store.updateCustomer) await store.updateCustomer(customerToEdit.value.uuid, data);
  } else {
    if (store.createCustomer) await store.createCustomer(data);
  }
  isFormModalOpen.value = false;
  store.fetch();
}

const promptDeleteCustomer = (uuid: string) => {
  customerUuidToDelete.value = uuid;
  isDeleteModalOpen.value = true;
}

const confirmDeleteCustomer = async () => {
  if (customerUuidToDelete.value && store.deleteCustomer) {
    await store.deleteCustomer(customerUuidToDelete.value);
    store.fetch();
  }
  isDeleteModalOpen.value = false;
  customerUuidToDelete.value = null;
}

onMounted(() => {
  store.fetch()
})
</script>