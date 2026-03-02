<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

        <div
            class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all border border-slate-200 max-h-[90vh] flex flex-col">

            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building2 class="w-5 h-5 text-blue-600" />
                    {{ isEditing ? 'Editar Cadastro' : 'Novo Cadastro' }}
                </h3>
                <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors">
                    <X class="w-6 h-6" />
                </button>
            </div>

            <form @submit.prevent="handleSave" class="flex flex-col flex-1 overflow-hidden">

                <div class="overflow-y-auto p-6 custom-scrollbar flex-1">
                    <div class="space-y-8">
                        <div>
                            <h4 class="text-sm font-bold text-blue-600 border-b border-slate-100 pb-2 mb-4">Dados da
                                Empresa</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Razão
                                        Social *</label>
                                    <input v-model="form.companyName" required type="text"
                                        placeholder="Ex: Tech Solutions LTDA"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nome
                                        Fantasia</label>
                                    <input v-model="form.tradeName" type="text" placeholder="Ex: Tech Solutions"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">CNPJ
                                        / CPF</label>
                                    <input v-model="form.document" type="text" placeholder="00.000.000/0000-00"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Site</label>
                                    <input v-model="form.website" type="url" placeholder="https://www.empresa.com.br"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4
                                class="text-sm font-bold text-blue-600 border-b border-slate-100 pb-2 mb-4 flex justify-between items-center">
                                Endereço Comercial
                                <span v-if="isLoadingCep"
                                    class="text-xs text-blue-500 font-medium flex items-center gap-1">
                                    <Loader2 class="w-3 h-3 animate-spin" /> Buscando CEP...
                                </span>
                            </h4>
                            <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div class="md:col-span-2">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">CEP</label>
                                    <input v-model="form.zipCode" type="text" placeholder="00000-000" maxlength="9"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div class="md:col-span-3">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Logradouro
                                        (Rua/Av)</label>
                                    <input v-model="form.street" type="text"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div class="md:col-span-1">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Número</label>
                                    <input v-model="form.number" type="text" id="numero-input"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div class="md:col-span-3">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Complemento</label>
                                    <input v-model="form.complement" type="text"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div class="md:col-span-3">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Bairro</label>
                                    <input v-model="form.neighborhood" type="text"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div class="md:col-span-4">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Cidade</label>
                                    <input v-model="form.city" type="text"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div class="md:col-span-2">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Estado
                                        (UF)</label>
                                    <input v-model="form.state" type="text" maxlength="2" placeholder="SP"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all uppercase">
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-sm font-bold text-blue-600 border-b border-slate-100 pb-2 mb-4">Contato
                                Principal</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="md:col-span-2">
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nome
                                        do Contato *</label>
                                    <input v-model="form.name" required type="text" placeholder="Ex: João da Silva"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Telefone
                                        / WhatsApp *</label>
                                    <input v-model="form.phone" required type="text" placeholder="(00) 00000-0000"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                                <div>
                                    <label
                                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">E-mail
                                        *</label>
                                    <input v-model="form.email" required type="email" placeholder="contato@empresa.com"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                <select v-model="form.status"
                                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Origem
                                    do Lead</label>
                                <select v-model="form.source"
                                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all">
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="Site">Site / Formulário</option>
                                    <option value="Indicação">Indicação</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <button type="button" @click="$emit('close')"
                        class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                    <button type="submit"
                        class="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition-transform active:scale-95 flex items-center gap-2">
                        <Save class="w-4 h-4" />
                        {{ isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente' }}
                    </button>
                </div>
            </form>

        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import { CustomerStatus } from '../../domain/valueObjects/customer-status.enum';
import type { ICustomer } from '../../domain/entities/customer';
import { Building2, X, Save, Loader2 } from 'lucide-vue-next';

const props = defineProps<{
    isOpen: boolean;
    customerData: Partial<ICustomer> | null;
}>();

const emit = defineEmits(['close', 'save']);

const isEditing = reactive({ value: false });
const isLoadingCep = ref(false);

const form = reactive({
    name: '', companyName: '', tradeName: '', document: '', website: '',
    zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
    phone: '', email: '', status: CustomerStatus.ACTIVE, source: 'WhatsApp', avatar: ''
});

// LÓGICA DE AUTOCOMPLETAR CEP VIA API PÚBLICA
watch(() => form.zipCode, async (newCep) => {
    const cleanCep = newCep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
        isLoadingCep.value = true;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                form.street = data.logradouro;
                form.neighborhood = data.bairro;
                form.city = data.localidade;
                form.state = data.uf;
                document.getElementById('numero-input')?.focus();
            }
        } catch (error) {
            console.error("Erro ao buscar CEP", error);
        } finally {
            isLoadingCep.value = false;
        }
    }
});

watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        if (props.customerData) {
            isEditing.value = true;
            Object.assign(form, {
                name: props.customerData.name || '',
                companyName: props.customerData.companyName || '',
                tradeName: props.customerData.tradeName || '',
                document: props.customerData.document || '',
                website: props.customerData.website || '',
                zipCode: props.customerData.zipCode || '',
                street: props.customerData.street || '',
                number: props.customerData.number || '',
                complement: props.customerData.complement || '',
                neighborhood: props.customerData.neighborhood || '',
                city: props.customerData.city || '',
                state: props.customerData.state || '',
                phone: props.customerData.phone || '',
                email: props.customerData.email || '',
                status: props.customerData.status || CustomerStatus.ACTIVE,
                source: props.customerData.source || 'WhatsApp',
                avatar: props.customerData.avatar || ''
            });
        } else {
            isEditing.value = false;
            Object.assign(form, {
                name: '', companyName: '', tradeName: '', document: '', website: '',
                zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
                phone: '', email: '', status: CustomerStatus.ACTIVE, source: 'WhatsApp', avatar: ''
            });
        }
    }
});

const handleSave = () => {
    if (!form.avatar) {
        const initials = form.tradeName || form.companyName || 'EM';
        form.avatar = initials.substring(0, 2).toUpperCase();
    }
    emit('save', { ...form });
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 20px;
}
</style>