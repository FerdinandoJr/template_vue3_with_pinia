<template>
  <div class="flex flex-col gap-6">
    <ClientStats 
      :total="total"
    />

    <ClientTable 
      :clients="items"
    />

    <ClientDrawer 
      :is-open="isDrawerOpen" 
      @close="closeDrawer" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCustomerStore } from '../store/customer.store'
import ClientStats from '../components/CustomerStats.vue'
import ClientTable from '../components/CustomerTable.vue'
import ClientDrawer from '../components/CustomerDrawer.vue'

const store = useCustomerStore()
const { items, total } = storeToRefs(store)

// Controle de UI local
const isDrawerOpen = ref(false)
const selectedClientId = ref<string | null>(null)


const closeDrawer = () => {
    isDrawerOpen.value = false
    setTimeout(() => selectedClientId.value = null, 300)
}

onMounted(() => {
  store.fetch()
})
</script>