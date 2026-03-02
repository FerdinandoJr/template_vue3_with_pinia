<template>
    <div class="h-full flex flex-col max-w-[1400px] mx-auto w-full relative">

        <div v-if="isLoading" class="flex-1 p-8 space-y-6 animate-pulse">
            <div class="w-32 h-4 bg-slate-200 rounded"></div>
            <div class="h-48 bg-slate-200 rounded-3xl w-full"></div>
            <div class="grid grid-cols-2 gap-6">
                <div class="h-24 bg-slate-200 rounded-2xl"></div>
                <div class="h-24 bg-slate-200 rounded-2xl"></div>
            </div>
            <div class="h-64 bg-slate-200 rounded-2xl w-full"></div>
        </div>

        <template v-else-if="customer">
            <div class="mb-4 shrink-0">
                <button @click="router.push('/clientes')"
                    class="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <ArrowLeft class="w-4 h-4" /> Voltar para Clientes
                </button>
            </div>

            <div class="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden shrink-0 mb-6">
                <div class="h-32 bg-gradient-to-r from-slate-800 to-slate-700"></div>
                <div class="px-8 pb-0 relative">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex gap-6">
                            <div
                                class="w-28 h-28 bg-white rounded-[20px] p-2 shadow-lg border border-slate-100 shrink-0 -mt-12 relative z-10">
                                <div
                                    class="w-full h-full bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-4xl font-black">
                                    {{ customer.avatar }}
                                </div>
                            </div>
                            <div class="pt-3 pb-2">
                                <div class="flex items-center gap-3 mb-1.5">
                                    <h1 class="text-3xl font-black text-slate-800 leading-none">
                                        <span v-if="customer.tradeName">{{ customer.tradeName }}</span>
                                        <span v-else>{{ customer.companyName }}</span>
                                    </h1>
                                    <span :class="getStatusBadge(customer.status)">
                                        <span v-if="customer.status === 'active'">Ativo</span>
                                        <span v-else>Inativo</span>
                                    </span>
                                </div>
                                <div class="flex items-center gap-3 text-sm font-bold text-slate-500">
                                    <span v-if="customer.tradeName && customer.tradeName !== customer.companyName"
                                        class="uppercase tracking-wider">
                                        Razão: {{ customer.companyName }}
                                    </span>
                                    <span v-if="customer.document"
                                        class="flex items-center gap-1.5 border-l border-slate-300 pl-3">
                                        <FileText class="w-4 h-4" /> {{ customer.document }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-8 border-t border-slate-100">
                        <button @click="activeTab = 'overview'"
                            :class="['py-5 text-sm font-bold border-b-[3px] transition-colors', activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']">
                            Visão Geral
                        </button>
                        <button @click="activeTab = 'contacts'"
                            :class="['py-5 text-sm font-bold border-b-[3px] transition-colors flex items-center gap-2', activeTab === 'contacts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']">
                            Contatos / Equipe
                            <span v-if="customer.additionalContacts?.length"
                                class="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-md text-[10px]">{{
                                    customer.additionalContacts.length + 1 }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto custom-scrollbar pb-10">

                <div v-show="activeTab === 'overview'"
                    class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

                    <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                    Satisfação (CSAT)</p>
                                <div class="flex items-end gap-1">
                                    <h3 class="text-3xl font-black"
                                        :class="customer.csat >= 4 ? 'text-green-600' : 'text-amber-500'">{{
                                        Number(customer.csat).toFixed(1) }}</h3>
                                    <span class="text-sm font-bold text-slate-400 mb-1">/ 5.0</span>
                                </div>
                            </div>
                            <div class="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-3xl">⭐
                            </div>
                        </div>

                        <div
                            class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Última
                                    Interação</p>
                                <h3 class="text-xl font-black text-slate-800">{{ formatDate(customer.lastInteraction) }}
                                </h3>
                                <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">via
                                    <span v-if="customer.source">{{ customer.source }}</span>
                                    <span v-else>Sistema</span>
                                </p>
                            </div>
                            <div class="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-3xl">⏱️
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div class="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3
                                class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <Building2 class="w-4 h-4 text-blue-500" /> Informações da Empresa
                            </h3>
                            <button @click.prevent="isEditModalOpen = true"
                                class="text-xs font-bold text-blue-600 bg-white border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5">
                                <Pencil class="w-3 h-3" /> Editar Dados
                            </button>
                        </div>
                        <div class="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
                            <div>
                                <label
                                    class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Razão
                                    Social</label>
                                <p class="text-[15px] font-medium text-slate-800">{{ customer.companyName }}</p>
                            </div>
                            <div>
                                <label
                                    class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome
                                    Fantasia</label>
                                <p v-if="customer.tradeName" class="text-[15px] font-medium text-slate-800">{{
                                    customer.tradeName }}</p>
                                <p v-else class="text-[15px] font-medium text-slate-400 italic">Não preenchido</p>
                            </div>
                            <div>
                                <label
                                    class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CNPJ</label>
                                <p v-if="customer.document" class="text-[15px] font-medium text-slate-800">{{
                                    customer.document }}</p>
                                <p v-else class="text-[15px] font-medium text-slate-400 italic">Não informado</p>
                            </div>
                            <div>
                                <label
                                    class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Website</label>
                                <a v-if="customer.website" :href="customer.website" target="_blank"
                                    class="text-[15px] font-bold text-blue-600 hover:underline">
                                    {{ customer.website }}
                                </a>
                                <p v-else class="text-[15px] font-medium text-slate-400 italic">Não informado</p>
                            </div>

                            <div class="lg:col-span-4 pt-6 border-t border-slate-100">
                                <label
                                    class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 mb-3">Endereço
                                    Comercial</label>
                                <div v-if="customer.street"
                                    class="bg-slate-50 p-5 rounded-xl border border-slate-200 text-[15px] text-slate-700 flex flex-col md:flex-row md:items-center gap-6">
                                    <div class="flex-1">
                                        <p>
                                            <span class="font-bold text-slate-900">{{ customer.street }}</span>,
                                            <span v-if="customer.number">{{ customer.number }}</span><span
                                                v-else>S/N</span>
                                            <span v-if="customer.complement" class="text-slate-500"> - {{
                                                customer.complement }}</span>
                                        </p>
                                        <p class="mt-1">{{ customer.neighborhood }}</p>
                                    </div>
                                    <div
                                        class="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                                        <p>{{ customer.city }} - {{ customer.state }}</p>
                                        <p class="text-slate-500 mt-1 font-medium">CEP: {{ customer.zipCode }}</p>
                                    </div>
                                </div>
                                <p v-else
                                    class="text-[15px] font-medium text-slate-400 italic bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    Endereço não cadastrado.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-show="activeTab === 'contacts'" class="space-y-6 animate-in fade-in duration-300">

                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div class="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3
                                    class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <User class="w-4 h-4 text-blue-500" /> Pessoas e Responsáveis
                                </h3>
                            </div>
                            <button @click.prevent="openNewContactModal"
                                class="text-xs font-bold text-blue-600 bg-white border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5">
                                <UserPlus class="w-3 h-3" /> Novo Contato
                            </button>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr
                                        class="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                        <th class="px-6 py-3">Nome / Cargo</th>
                                        <th class="px-6 py-3">Telefone</th>
                                        <th class="px-6 py-3">E-mail</th>
                                        <th class="px-6 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm divide-y divide-slate-50">

                                    <tr class="hover:bg-slate-50 transition-colors group bg-blue-50/20">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-200 shrink-0">
                                                    {{ customer.name.charAt(0).toUpperCase() }}
                                                </div>
                                                <div>
                                                    <p class="font-bold text-slate-800 flex items-center gap-1.5">
                                                        {{ customer.name }}
                                                        <Star class="w-3 h-3 text-amber-500 fill-amber-500"
                                                            title="Contato Principal" />
                                                    </p>
                                                    <p
                                                        class="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
                                                        Contato Principal</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-2 text-slate-600">
                                                <Phone class="w-3.5 h-3.5 text-slate-400" />
                                                <span v-if="customer.phone" class="font-medium">{{ customer.phone
                                                    }}</span>
                                                <span v-else class="text-slate-400 italic">Não informado</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-2 text-slate-600">
                                                <Mail class="w-3.5 h-3.5 text-slate-400" />
                                                <span v-if="customer.email" class="font-medium">{{ customer.email
                                                    }}</span>
                                                <span v-else class="text-slate-400 italic">Não informado</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <button @click.prevent="isEditModalOpen = true"
                                                class="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                                                Editar Cadastro
                                            </button>
                                        </td>
                                    </tr>

                                    <tr v-for="(cont, index) in (customer.additionalContacts || [])" :key="index"
                                        class="hover:bg-slate-50 transition-colors group">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div
                                                    class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm border border-slate-200 shrink-0">
                                                    {{ cont.name.charAt(0).toUpperCase() }}
                                                </div>
                                                <div>
                                                    <p class="font-bold text-slate-700">{{ cont.name }}</p>
                                                    <p
                                                        class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                                                        <span v-if="cont.role">{{ cont.role }}</span>
                                                        <span v-else>Equipe</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-2 text-slate-600">
                                                <Phone class="w-3.5 h-3.5 text-slate-400" />
                                                <span v-if="cont.phone" class="font-medium">{{ cont.phone }}</span>
                                                <span v-else class="text-slate-400 italic">Não informado</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-2 text-slate-600">
                                                <Mail class="w-3.5 h-3.5 text-slate-400" />
                                                <span v-if="cont.email" class="font-medium">{{ cont.email }}</span>
                                                <span v-else class="text-slate-400 italic">Não informado</span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div
                                                class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button @click.prevent="openEditContactModal(index)"
                                                    class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar">
                                                    <Pencil class="w-4 h-4" />
                                                </button>
                                                <button @click.prevent="promptDeleteContact(index)"
                                                    class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir">
                                                    <Trash2 class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </template>

        <div v-else class="flex-1 flex flex-col items-center justify-center">
            <h2 class="text-2xl font-bold text-slate-800">Cliente não encontrado</h2>
            <button @click="router.push('/clientes')" class="mt-4 text-blue-600 hover:underline font-medium">Voltar para
                a
                lista</button>
        </div>

        <Teleport to="body">
            <CustomerFormModal v-if="isEditModalOpen" :is-open="isEditModalOpen" :customer-data="customer"
                @close="isEditModalOpen = false" @save="handleSaveMainCustomer" />

            <div v-if="isContactModalOpen"
                class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div
                    class="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">

                    <div
                        class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                        <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <User class="w-5 h-5 text-blue-600" />
                            <span v-if="editingContactIndex !== null">Editar Contato</span>
                            <span v-else>Novo Contato</span>
                        </h3>
                        <button @click="isContactModalOpen = false" class="text-slate-400 hover:text-slate-600">
                            <X class="w-6 h-6" />
                        </button>
                    </div>

                    <div class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                        <div>
                            <label
                                class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5 ml-1">Nome
                                Completo *</label>
                            <input v-model="contactForm.name" type="text" required
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                        </div>
                        <div>
                            <label
                                class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5 ml-1">Cargo
                                / Setor</label>
                            <input v-model="contactForm.role" type="text"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                        </div>
                        <div>
                            <label
                                class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5 ml-1">Telefone
                                / WhatsApp</label>
                            <input v-model="contactForm.phone" type="text"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                        </div>
                        <div>
                            <label
                                class="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5 ml-1">E-mail</label>
                            <input v-model="contactForm.email" type="email"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
                        </div>
                    </div>

                    <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                        <button @click="isContactModalOpen = false"
                            class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                        <button @click="handleSaveContact" :disabled="!contactForm.name.trim()"
                            class="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Salvar</button>
                    </div>
                </div>
            </div>

            <div v-if="isDeleteContactModalOpen"
                class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div
                    class="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                    <div
                        class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 class="w-8 h-8" />
                    </div>
                    <h3 class="text-center text-xl font-bold text-slate-800 mb-2">Excluir Contato?</h3>
                    <p class="text-center text-sm text-slate-500 mb-8 px-2">Esta ação removerá este contato da sua
                        lista. Essa
                        ação não pode ser desfeita.</p>
                    <div class="flex gap-3">
                        <button @click="isDeleteContactModalOpen = false"
                            class="flex-1 px-5 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                        <button @click="handleConfirmDeleteContact"
                            class="flex-1 px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 transition-colors">Sim,
                            Excluir</button>
                    </div>
                </div>
            </div>

        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Building2, Pencil, FileText, UserPlus, Phone, Mail, User, X, Trash2, Star } from 'lucide-vue-next';

import { useCustomerDetails } from '../composables/useCustomerDetails';
import CustomerFormModal from '../components/CustomerFormModal.vue';
import type { ICustomer, IContactPerson } from '../../domain/entities/customer';

const route = useRoute();
const router = useRouter();

const { customer, isLoading, updateMainData, saveContact, removeContact } = useCustomerDetails(route.params.id as string);

const activeTab = ref('overview');

const isEditModalOpen = ref(false);
const isContactModalOpen = ref(false);
const isDeleteContactModalOpen = ref(false);

const editingContactIndex = ref<number | null>(null);
const contactIndexToDelete = ref<number | null>(null);

const contactForm = ref<IContactPerson>({ name: '', role: '', phone: '', email: '' });

const handleSaveMainCustomer = async (data: Partial<ICustomer>) => {
    await updateMainData(data);
    isEditModalOpen.value = false;
};

const openNewContactModal = () => {
    editingContactIndex.value = null;
    contactForm.value = { name: '', role: '', phone: '', email: '' };
    isContactModalOpen.value = true;
};

const openEditContactModal = (index: number) => {
    editingContactIndex.value = index;

    if (customer.value && customer.value.additionalContacts) {
        const contact = customer.value.additionalContacts[index];
        if (contact) {
            contactForm.value = {
                name: contact.name || '',
                role: contact.role || '',
                phone: contact.phone || '',
                email: contact.email || ''
            };
        }
    }
    isContactModalOpen.value = true;
};

const handleSaveContact = async () => {
    await saveContact(contactForm.value, editingContactIndex.value);
    isContactModalOpen.value = false;
};

const promptDeleteContact = (index: number) => {
    contactIndexToDelete.value = index;
    isDeleteContactModalOpen.value = true;
};

const handleConfirmDeleteContact = async () => {
    if (contactIndexToDelete.value !== null) {
        await removeContact(contactIndexToDelete.value);
    }
    isDeleteContactModalOpen.value = false;
    contactIndexToDelete.value = null;
};

const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        active: 'bg-green-100 text-green-700 border border-green-200',
        inactive: 'bg-slate-100 text-slate-600 border border-slate-200'
    }
    return `px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest ${styles[status] || 'bg-slate-100 text-slate-500'}`
};

const formatDate = (date: Date | string) => {
    if (!date) return '--/--/----';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
</style>