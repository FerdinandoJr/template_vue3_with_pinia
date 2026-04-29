<template>
    <div v-if="customer" class="p-4 lg:p-8 max-w-[1400px] mx-auto h-full overflow-y-auto custom-scroll">

        <div class="mb-6 flex items-center justify-between">
            <el-button @click="router.back()"
                class="!border-none !bg-transparent !p-0 hover:!text-blue-600 transition-colors">
                <div class="flex items-center gap-2 text-slate-500 font-bold">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon> Voltar para Lista
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

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            <div class="lg:col-span-4 flex flex-col gap-6 sticky top-0">

                <div
                    class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center flex-shrink-0 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <div class="relative mt-8 mb-4">
                        <el-avatar :size="100"
                            class="bg-white text-blue-600 font-black text-4xl shadow-md border-4 border-white">
                            {{ customer.tradeName?.charAt(0).toUpperCase() ||
                                customer.companyName?.charAt(0).toUpperCase() || customer.name?.charAt(0).toUpperCase() ||
                                '?' }}
                        </el-avatar>
                    </div>

                    <h2 class="text-xl font-black text-slate-800 mb-1 tracking-tight">
                        {{ customer.tradeName || customer.companyName || customer.name }}
                    </h2>

                    <div class="flex justify-center gap-2 mb-6 mt-3">
                        <el-tag :type="customer.status === 'active' ? 'success' : 'info'" effect="light"
                            class="!font-bold !rounded-md !border-none" size="small">
                            <span class="flex items-center gap-1">
                                <div class="w-1.5 h-1.5 rounded-full"
                                    :class="customer.status === 'active' ? 'bg-green-500' : 'bg-slate-400'"></div>
                                {{ customer.status === 'active' ? 'Ativo' : 'Desativado' }}
                            </span>
                        </el-tag>
                        <el-tag type="primary" effect="plain" class="!font-bold !rounded-md" size="small">
                            {{ customer.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física' }}
                        </el-tag>
                    </div>

                    <div class="flex flex-col gap-3">
                        <a v-if="customer.phone" :href="`https://wa.me/55${customer.phone.replace(/\\D/g, '')}`"
                            target="_blank"
                            class="flex items-center justify-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-all text-green-700 text-sm border border-green-200 font-bold group">
                            <el-icon class="text-lg group-hover:scale-110 transition-transform">
                                <ChatDotRound />
                            </el-icon>
                            WhatsApp Principal
                        </a>

                        <a v-if="customer.email" :href="`mailto:${customer.email}`"
                            class="flex items-center justify-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all text-slate-600 text-sm border border-slate-200 hover:border-blue-200 font-semibold truncate">
                            <el-icon class="text-blue-500 text-lg">
                                <Message />
                            </el-icon>
                            {{ customer.email }}
                        </a>

                        <a v-if="customer.website"
                            :href="customer.website.startsWith('http') ? customer.website : `https://${customer.website}`"
                            target="_blank"
                            class="flex items-center justify-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all text-slate-600 text-sm border border-slate-200 font-semibold">
                            <el-icon class="text-slate-500 text-lg">
                                <Link />
                            </el-icon>
                            Acessar Website
                        </a>
                    </div>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3
                        class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <el-icon>
                            <Connection />
                        </el-icon> Sistema
                    </h3>
                    <div class="flex justify-between items-center py-2 border-b border-slate-100">
                        <span class="text-sm text-slate-500">Origem</span>
                        <span class="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{{
                            customer.source || 'Não informada' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-slate-500">Documento</span>
                        <span class="text-sm font-bold text-slate-700 font-mono">{{ customer.document || '-' }}</span>
                    </div>
                </div>

            </div>

            <div class="lg:col-span-8 flex flex-col h-full">

                <div
                    class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[600px]">
                    <el-tabs v-model="activeTab" class="enterprise-tabs px-2 sm:px-6 flex-1 flex flex-col pt-2">

                        <el-tab-pane label="Visão Geral" name="overview">
                            <div class="py-6 space-y-8">

                                <div>
                                    <h3
                                        class="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                                        <el-icon class="text-blue-500 text-lg">
                                            <Document />
                                        </el-icon> Dados Cadastrais
                                    </h3>
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                        <div v-if="customer.type === 'PJ'">
                                            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                Razão Social</p>
                                            <p class="text-slate-800 font-semibold">{{ customer.companyName || '-' }}
                                            </p>
                                        </div>
                                        <div v-if="customer.type === 'PJ'">
                                            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                Nome Fantasia</p>
                                            <p class="text-slate-800 font-semibold">{{ customer.tradeName || '-' }}</p>
                                        </div>
                                        <div v-if="customer.type === 'PF'">
                                            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                Nome Completo</p>
                                            <p class="text-slate-800 font-semibold">{{ customer.name || '-' }}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{{
                                                customer.type === 'PJ' ? 'CNPJ' : 'CPF' }}</p>
                                            <p class="text-slate-800 font-semibold font-mono">{{ customer.document ||
                                                '-' }}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                                                Telefone Principal</p>
                                            <p class="text-slate-800 font-semibold">{{ formatPhone(customer.phone) ||
                                                '-' }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3
                                        class="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2 border-l-4 border-orange-400 pl-3">
                                        <el-icon class="text-orange-400 text-lg">
                                            <Location />
                                        </el-icon> Localização
                                    </h3>
                                    <div
                                        class="bg-slate-50 p-5 rounded-xl border border-slate-100 flex items-start gap-4">
                                        <div
                                            class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                                            <el-icon class="text-orange-500 text-xl">
                                                <MapLocation />
                                            </el-icon>
                                        </div>
                                        <div v-if="customer.zipCode" class="flex-1">
                                            <p class="text-slate-800 font-bold text-lg leading-tight">{{ customer.street
                                            }}, {{ customer.number }}</p>
                                            <p class="text-slate-600 mt-1" v-if="customer.complement">{{
                                                customer.complement }}</p>
                                            <p class="text-slate-500 mt-1">{{ customer.neighborhood }} • {{
                                                customer.city }} - {{ customer.state }}</p>
                                            <p class="text-slate-400 mt-2 font-mono text-sm">CEP: {{ customer.zipCode }}
                                            </p>
                                        </div>
                                        <div v-else class="flex-1 flex items-center h-12">
                                            <p class="text-slate-400 italic">Nenhum endereço cadastrado para este
                                                cliente.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3
                                        class="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
                                        <el-icon class="text-emerald-500 text-lg">
                                            <UserFilled />
                                        </el-icon> Contatos Vinculados
                                    </h3>

                                    <div v-if="customer.contacts && customer.contacts.length > 0"
                                        class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div v-for="(contact, index) in customer.contacts" :key="index"
                                            class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between group">
                                            <div class="flex items-center gap-3 overflow-hidden">
                                                <el-avatar :size="40"
                                                    class="bg-slate-100 text-slate-600 font-bold flex-shrink-0">
                                                    {{ contact.name?.charAt(0).toUpperCase() || '?' }}
                                                </el-avatar>
                                                <div class="truncate">
                                                    <p class="font-bold text-slate-800 text-sm truncate">{{ contact.name
                                                    }}</p>
                                                    <p
                                                        class="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                                                        {{ contact.role || 'Colaborador' }}</p>
                                                    <p class="text-xs text-slate-500 font-mono mt-0.5">{{
                                                        formatPhone(contact.phone) }}</p>
                                                </div>
                                            </div>
                                            <a v-if="contact.phone"
                                                :href="`https://wa.me/55${contact.phone.replace(/\\D/g, '')}`"
                                                target="_blank"
                                                class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition-colors flex-shrink-0"
                                                title="Chamar no WhatsApp">
                                                <el-icon class="text-xl">
                                                    <ChatDotRound />
                                                </el-icon>
                                            </a>
                                        </div>
                                    </div>

                                    <div v-else
                                        class="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                        <el-icon class="text-4xl text-slate-300 mb-2">
                                            <User />
                                        </el-icon>
                                        <p class="text-slate-500 font-medium">Nenhum contato vinculado.</p>
                                        <p class="text-xs text-slate-400 mt-1">Adicione funcionários através da edição
                                            de cadastro.</p>
                                    </div>
                                </div>

                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Histórico de Atendimentos" name="history">
                            <div class="py-6">
                                <div v-if="loadingServices" class="flex justify-center p-8">
                                    <el-icon class="is-loading"><Loading /></el-icon>
                                </div>
                                <div v-else-if="services.length === 0" class="text-center text-slate-400 py-8">
                                    <el-icon :size="40" class="mb-2"><ChatDotRound /></el-icon>
                                    <p>Nenhum atendimento registrado para este cliente.</p>
                                </div>
                                <div v-else class="space-y-4">
                                    <div v-for="service in services" :key="service.id"
                                        class="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                        <div class="flex items-center gap-4">
                                            <div
                                                class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                #{{ service.protocol?.slice(-4) || service.id?.slice(-4) }}
                                            </div>
                                            <div>
                                                <p class="text-sm font-bold text-slate-800">{{ service.subject || 'Atendimento' }}</p>
                                                <p class="text-[11px] text-slate-400 font-medium uppercase">{{ formatDate(service.createdAt) }}</p>
                                            </div>
                                        </div>
                                        <el-tag :type="getStatusType(service.status)" size="small" effect="light"
                                            class="!rounded-md !font-bold">{{ getStatusLabel(service.status) }}</el-tag>
                                    </div>
                                </div>
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
import CustomerFormModal from '../components/CustomerFormModal.vue';
import { ElMessage } from 'element-plus';
import { serviceServices, type IServiceItem } from '@/modules/service/data/service.services';

// Importando todos os ícones necessários para esse layout top
import {
    ArrowLeft, Edit, Message, Location, Document,
    MapLocation, ChatDotRound, Link, Connection, UserFilled, User, Loading
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const store = useCustomerStore();

const customer = ref<any>(null);
const activeTab = ref('overview'); // Começa na aba de Visão Geral
const isModalOpen = ref(false);
const services = ref<IServiceItem[]>([]);
const loadingServices = ref(false);

const formatPhone = (phone?: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};

const loadCustomer = async () => {
    const id = route.params.id as string;
    try {
        const data = await store.fetchById(id);
        if (data) {
            customer.value = data;
        } else {
            ElMessage.error('Cliente não encontrado.');
            router.push('/customer');
        }
    } catch (error) {
        ElMessage.error('Erro ao carregar cliente.');
        router.push('/customer');
    }
};

const handleUpdate = async (updatedData: any) => {
    await store.updateCustomer(updatedData.id, updatedData);
    ElMessage.success('Cadastro atualizado com sucesso!');
    isModalOpen.value = false;
    loadCustomer();
};

const loadServices = async () => {
    if (!customer.value?.id) return;
    loadingServices.value = true;
    try {
        const allServices = await serviceServices.list({ customerId: customer.value.id });
        services.value = allServices;
    } catch (error) {
        services.value = [];
    } finally {
        loadingServices.value = false;
    }
};

const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
};

const getStatusType = (status?: string) => {
    switch (status) {
        case 'in_progress': return 'warning';
        case 'finished': return 'success';
        case 'canceled': return 'danger';
        default: return 'info';
    }
};

const getStatusLabel = (status?: string) => {
    switch (status) {
        case 'in_progress': return 'Em Andamento';
        case 'finished': return 'Finalizado';
        case 'canceled': return 'Cancelado';
        default: return status || 'Aberto';
    }
};

onMounted(() => {
    loadCustomer();
    loadServices();
});
</script>

<style scoped>
:deep(.enterprise-tabs .el-tabs__item) {
    font-weight: 600;
    color: #64748b;
    font-size: 14px;
}

:deep(.enterprise-tabs .el-tabs__item.is-active) {
    color: #2563eb;
}

:deep(.enterprise-tabs .el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: #e2e8f0;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
</style>