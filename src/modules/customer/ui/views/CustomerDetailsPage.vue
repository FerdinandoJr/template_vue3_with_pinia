<template>
    <div class="p-6 min-h-full">
        <div v-if="loading" class="flex flex-col items-center justify-center h-64">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p class="text-slate-500">Carregando perfil do cliente...</p>
        </div>

        <div v-else-if="customer" class="max-w-6xl mx-auto space-y-6">

            <div class="flex items-center justify-between mb-4">
                <el-button @click="router.back()" link>
                    <el-icon class="mr-1">
                        <ArrowLeft />
                    </el-icon> Voltar
                </el-button>
                <div class="flex gap-2">
                    <el-button type="primary" plain @click="openEditModal">
                        <el-icon class="mr-2">
                            <Edit />
                        </el-icon> Editar Cadastro
                    </el-button>
                    <el-button type="danger" plain @click="promptDelete">
                        <el-icon class="mr-2">
                            <Delete />
                        </el-icon> Excluir
                    </el-button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div class="lg:col-span-1 space-y-6">
                    <el-card class="!rounded-xl !border-slate-100 shadow-sm text-center py-6 relative overflow-hidden">
                        <div
                            class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10">
                        </div>

                        <el-avatar :size="100"
                            class="!bg-white !text-blue-600 !border-4 !border-white !text-3xl shadow-lg mb-4 relative z-10">
                            {{ customer.avatar }}
                        </el-avatar>

                        <h2 class="text-xl font-bold text-slate-800">{{ customer.tradeName || customer.companyName }}
                        </h2>
                        <p class="text-slate-500 text-sm mb-4">{{ customer.document || 'Sem Documento' }}</p>

                        <el-tag :type="customer.status === 'active' ? 'success' : 'danger'" effect="dark" round
                            class="mb-6">
                            {{ customer.status === 'active' ? 'Cliente Ativo' : 'Inativo' }}
                        </el-tag>

                        <div class="flex flex-col gap-3 px-4">
                            <a v-if="customer.phone" :href="`tel:${customer.phone}`"
                                class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 text-sm">
                                <el-icon class="text-blue-500">
                                    <Phone />
                                </el-icon>
                                {{ customer.phone }}
                            </a>
                            <a v-if="customer.email" :href="`mailto:${customer.email}`"
                                class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 text-sm">
                                <el-icon class="text-orange-500">
                                    <Message />
                                </el-icon>
                                {{ customer.email }}
                            </a>
                            <a v-if="customer.website" :href="customer.website" target="_blank"
                                class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 text-sm">
                                <el-icon class="text-indigo-500">
                                    <Link />
                                </el-icon>
                                {{ customer.website }}
                            </a>
                        </div>
                    </el-card>

                    <el-card class="!rounded-xl !border-slate-100 shadow-sm">
                        <template #header>
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-700">Insights</span>
                                <el-icon>
                                    <TrendCharts />
                                </el-icon>
                            </div>
                        </template>
                        <div class="flex justify-between text-center">
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold">Origem</p>
                                <p class="font-semibold text-blue-600">{{ customer.source || 'N/A' }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold">Desde</p>
                                <p class="font-semibold text-slate-700">{{ formatDate(customer.createdAt) }}</p>
                            </div>
                        </div>
                    </el-card>
                </div>

                <div class="lg:col-span-2">
                    <el-card class="!rounded-xl !border-slate-100 shadow-sm h-full">
                        <template #header>
                            <div class="flex items-center gap-2">
                                <el-icon class="text-blue-600" :size="20">
                                    <OfficeBuilding />
                                </el-icon>
                                <h3 class="font-bold text-lg text-slate-800">Visão Geral do Cadastro</h3>
                            </div>
                        </template>

                        <div class="mb-8">
                            <h4 class="text-sm font-bold text-slate-400 uppercase mb-4 border-b border-slate-50 pb-2">
                                Dados Corporativos
                            </h4>
                            <el-descriptions :column="2" border>
                                <el-descriptions-item label="Razão Social">{{ customer.companyName
                                }}</el-descriptions-item>
                                <el-descriptions-item label="Nome Fantasia">{{ customer.tradeName
                                }}</el-descriptions-item>
                                <el-descriptions-item label="CNPJ / CPF">{{ customer.document }}</el-descriptions-item>
                                <el-descriptions-item label="Contato Principal">{{ customer.name
                                }}</el-descriptions-item>
                            </el-descriptions>
                        </div>

                        <div>
                            <h4
                                class="text-sm font-bold text-slate-400 uppercase mb-4 border-b border-slate-50 pb-2 flex items-center gap-2">
                                <el-icon class="text-red-500">
                                    <Location />
                                </el-icon> Endereço Comercial
                            </h4>

                            <el-descriptions :column="2" border direction="vertical">
                                <el-descriptions-item label="CEP" width="150px">
                                    <span class="font-mono text-slate-600">{{ customer.zipCode }}</span>
                                </el-descriptions-item>
                                <el-descriptions-item label="Bairro">
                                    {{ customer.neighborhood }}
                                </el-descriptions-item>
                                <el-descriptions-item label="Logradouro">
                                    {{ customer.street }}
                                </el-descriptions-item>
                                <el-descriptions-item label="Número">
                                    {{ customer.number }}
                                </el-descriptions-item>
                                <el-descriptions-item label="Complemento" :span="2">
                                    {{ customer.complement || '-' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="Cidade">
                                    {{ customer.city }}
                                </el-descriptions-item>
                                <el-descriptions-item label="Estado (UF)">
                                    <el-tag size="small">{{ customer.state }}</el-tag>
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>
                    </el-card>
                </div>
            </div>
        </div>

        <CustomerFormModal v-if="isFormModalOpen" :is-open="isFormModalOpen" :customer-data="customer"
            @close="isFormModalOpen = false" @save="handleUpdateCustomer" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCustomerStore } from '../store/customer.store'
import {
    ArrowLeft, Edit, Delete, Phone, Message, Link,
    OfficeBuilding, Location, TrendCharts
} from '@element-plus/icons-vue'
import CustomerFormModal from '../components/CustomerFormModal.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { ICustomer } from '../../domain/entities/customer'

const route = useRoute()
const router = useRouter()
const store = useCustomerStore()
const { items, loading } = storeToRefs(store)

const isFormModalOpen = ref(false)

const customer = computed<ICustomer | null>(() => {
    return items.value.find(c => c.uuid === route.params.id) || null
})

const openEditModal = () => {
    isFormModalOpen.value = true
}

const handleUpdateCustomer = async (data: any) => {
    if (customer.value?.uuid) {
        await store.updateCustomer(customer.value.uuid, data)
        isFormModalOpen.value = false
        ElMessage.success('Cadastro atualizado com sucesso!')
    }
}

const promptDelete = async () => {
    try {
        await ElMessageBox.confirm(
            'Isso apagará permanentemente o cliente. Continuar?',
            'Atenção',
            { confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', type: 'warning' }
        )
        if (customer.value?.uuid) {
            await store.deleteCustomer(customer.value.uuid)
            router.push('/clientes')
            ElMessage.success('Cliente excluído com sucesso')
        }
    } catch { }
}

const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
}

onMounted(async () => {
    if (items.value.length === 0) await store.fetch()
})
</script>