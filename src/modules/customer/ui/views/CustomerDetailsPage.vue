<template>
    <div v-if="customer" class="p-4 lg:p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scroll">
        <div class="mb-6 flex items-center justify-between">
            <el-button @click="router.back()"
                class="!border-none !bg-transparent !p-0 hover:!text-blue-600 transition-colors">
                <div class="flex items-center gap-2 text-slate-500 font-bold">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    Voltar para Lista
                </div>
            </el-button>

            <div class="flex gap-3">
                <el-button type="primary" class="!font-bold !rounded-lg" @click="isModalOpen = true">
                    <el-icon class="mr-2">
                        <Edit />
                    </el-icon> Editar Cadastro
                </el-button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-4 flex flex-col gap-6">
                <div class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm text-center">
                    <div class="relative inline-block mb-4">
                        <el-avatar :size="100" :src="customer.avatar"
                            class="bg-blue-100 text-blue-600 font-black text-3xl ring-4 ring-blue-50">
                            {{ customer.name?.charAt(0).toUpperCase() }}
                        </el-avatar>
                        <div class="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"
                            title="Cliente Ativo"></div>
                    </div>

                    <h2 class="text-xl font-black text-slate-800 mb-1 uppercase tracking-tight">{{ customer.tradeName ||
                        customer.name }}</h2>
                    <p class="text-sm text-slate-500 font-medium mb-6">{{ customer.document }}</p>

                    <div class="flex flex-col gap-3">
                        <a v-if="customer.phone" :href="`tel:${customer.phone.replace(/\\D/g, '')}`"
                            class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all text-slate-600 text-sm border border-transparent hover:border-blue-100">
                            <el-icon class="text-blue-500 text-lg">
                                <Phone />
                            </el-icon>
                            <span class="font-bold">{{ formatPhone(customer.phone) }}</span>
                        </a>

                        <div v-if="customer.email"
                            class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-600 text-sm border border-transparent">
                            <el-icon class="text-blue-500 text-lg">
                                <Message />
                            </el-icon>
                            <span class="font-bold truncate">{{ customer.email }}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm">
                    <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Localização</h3>
                    <div v-if="customer.zipCode" class="space-y-4">
                        <div class="flex gap-3">
                            <el-icon class="mt-1 text-slate-400">
                                <Location />
                            </el-icon>
                            <div class="text-sm">
                                <p class="text-slate-800 font-bold">{{ customer.street }}, {{ customer.number }}</p>
                                <p class="text-slate-500">{{ customer.neighborhood }}</p>
                                <p class="text-slate-500">{{ customer.city }} - {{ customer.state }}</p>
                                <p class="text-slate-400 mt-1 font-mono text-xs">{{ customer.zipCode }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-4 text-slate-400 text-sm italic">
                        Endereço não informado.
                    </div>
                </div>
            </div>

            <div class="lg:col-span-8">
                <div class="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden h-full">
                    <el-tabs v-model="activeTab" class="enterprise-tabs px-6">
                        <el-tab-pane label="Histórico de Atendimentos" name="history">
                            <div class="py-6">
                                <div class="space-y-4">
                                    <div v-for="i in 3" :key="i"
                                        class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                #{{ 240 + i }}
                                            </div>
                                            <div>
                                                <p class="text-sm font-bold text-slate-800">Suporte Técnico - Instalação
                                                </p>
                                                <p class="text-[11px] text-slate-400 font-medium uppercase">12 Março
                                                    2026 • 14:30</p>
                                            </div>
                                        </div>
                                        <el-tag type="success" size="small" effect="light"
                                            class="!rounded-md !font-bold">Finalizado</el-tag>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Resumo Financeiro" name="financial">
                            <div class="py-12 text-center">
                                <el-icon class="text-slate-200 text-6xl mb-4">
                                    <Wallet />
                                </el-icon>
                                <p class="text-slate-500 font-medium">Nenhum histórico financeiro registrado para este
                                    cliente.</p>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>

        <CustomerFormModal v-if="isModalOpen" :is-open="isModalOpen" :customer-data="customer"
            @close="isModalOpen = false" @save="handleUpdate" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerStore } from '../store/customer.store';
import {
    ArrowLeft, Edit, Phone, Message, Location, Wallet
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import CustomerFormModal from '../components/CustomerFormModal.vue';

const route = useRoute();
const router = useRouter();
const store = useCustomerStore();

const customer = ref<any>(null);
const activeTab = ref('history');
const isModalOpen = ref(false);

const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

const loadCustomer = () => {
    // CORREÇÃO 1: route.params.id (o nome correto do parâmetro na rota)
    const uuid = route.params.id as string;
    const found = store.items.find(c => c.uuid === uuid);
    if (found) {
        customer.value = { ...found };
    } else {
        ElMessage.error('Cliente não encontrado.');
        // CORREÇÃO 2: Rota de volta para a lista (sem o "s" no final)
        router.push('/customer');
    }
};

const handleUpdate = async (updatedData: any) => {
    await store.updateCustomer(updatedData.uuid, updatedData);
    ElMessage.success('Cadastro atualizado com sucesso!');
    isModalOpen.value = false;
    loadCustomer();
};

onMounted(() => {
    if (store.items.length === 0) {
        store.fetch().then(loadCustomer);
    } else {
        loadCustomer();
    }
});
</script>

<style scoped>
.enterprise-tabs :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: 1px solid #f1f5f9;
}

.enterprise-tabs :deep(.el-tabs__item) {
    height: 60px;
    line-height: 60px;
    font-weight: 700;
    color: #64748b;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.enterprise-tabs :deep(.el-tabs__item.is-active) {
    color: #2563eb;
}

.enterprise-tabs :deep(.el-tabs__active-bar) {
    background-color: #2563eb;
    height: 3px;
    border-radius: 3px 3px 0 0;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
</style>