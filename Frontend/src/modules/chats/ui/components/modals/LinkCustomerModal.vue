<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && $emit('close')" title="Gestão de Identidade (CRM)"
        width="95%" style="max-width: 850px;" align-center destroy-on-close class="rounded-lg custom-dialog">

        <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
            <el-avatar :size="50" :src="contactAvatar" class="bg-blue-100 text-blue-600 font-bold text-xl">
                {{ contactName?.charAt(0).toUpperCase() || '?' }}
            </el-avatar>
            <div>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Contacto no WhatsApp</p>
                <h3 class="font-bold text-slate-800 text-lg">{{ contactName }}</h3>
                <p class="text-sm text-slate-600 font-mono">{{ contactPhone }}</p>
            </div>
        </div>

        <el-tabs class="enterprise-main-tabs mt-4" v-model="activeMainTab">
            <el-tab-pane name="link">
                <template #label>
                    <span class="flex items-center gap-2 px-2 text-[13px] font-black tracking-wide uppercase">
                        <el-icon size="16"><Search /></el-icon> Vincular Existente
                    </span>
                </template>
                <div class="p-6 bg-white border border-slate-200 rounded-xl mt-4 shadow-sm h-[380px]">
                    <el-form label-position="top" class="enterprise-form">
                        <el-form-item label="Buscar Cliente na Base" class="!mb-6">
                            <el-select v-model="linkForm.customerUuid" filterable remote
                                :remote-method="remoteSearchCustomer" :loading="loadingSearch" class="w-full enterprise-select"
                                placeholder="Digite Nome, Razão Social, Telefone ou CPF/CNPJ..." size="large">
                                <template #prefix><el-icon><Search /></el-icon></template>
                                <el-option v-for="item in searchResults" :key="item.uuid" :label="item.name"
                                    :value="item.uuid" />
                            </el-select>
                            <p class="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1.5">
                                <el-icon><InfoFilled /></el-icon> Selecione um cliente já registado para vincular a este número de WhatsApp.
                            </p>
                        </el-form-item>

                        <div v-if="linkForm.customerUuid" class="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-slate-100 pt-5">
                            <el-form-item label="Nome da Pessoa de Contato *" required class="!mb-2">
                                <el-input v-model="linkForm.contactName" size="large"
                                    placeholder="Ex: João da Silva (Financeiro)" class="enterprise-input" />
                                <p class="text-[11px] text-indigo-500 font-bold mt-1.5">Identifique o nome de quem está falando deste número dentro da empresa selecionada.</p>
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
            </el-tab-pane>

            <el-tab-pane name="new">
                <template #label>
                    <span class="flex items-center gap-2 px-2 text-[13px] font-black tracking-wide uppercase">
                        <el-icon size="16"><Plus /></el-icon> Novo Registo Completo
                    </span>
                </template>
                <div class="bg-white border border-slate-200 rounded-xl mt-4 shadow-sm overflow-hidden h-[380px]">
                    <el-form ref="newCustomerFormRef" :model="newCustomerForm" :rules="formRules" label-position="top"
                        class="p-0 enterprise-form">
                        <el-tabs v-model="activeInnerTab" class="enterprise-inner-tabs px-6 pt-3 bg-slate-50 border-b border-slate-100">
                            <el-tab-pane label="Dados Pessoais" name="personal">
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 p-6 bg-white h-[320px] overflow-y-auto custom-scroll">
                                    <div class="col-span-1 sm:col-span-2">
                                        <el-form-item label="Tipo Jurídico" class="!mb-2">
                                            <el-radio-group v-model="newCustomerForm.type" size="default"
                                                @change="resetDocument">
                                                <el-radio-button label="Pessoa Física (PF)" value="PF" />
                                                <el-radio-button label="Pessoa Jurídica (PJ)" value="PJ" />
                                            </el-radio-group>
                                        </el-form-item>
                                    </div>
                                    <div class="col-span-1 sm:col-span-2">
                                        <el-form-item
                                            :label="newCustomerForm.type === 'PJ' ? 'Razão Social' : 'Nome Completo'"
                                            prop="name" class="!mb-2">
                                            <el-input v-model="newCustomerForm.name" class="enterprise-input" placeholder="Digite o nome..." />
                                        </el-form-item>
                                    </div>
                                    <div v-if="newCustomerForm.type === 'PJ'" class="col-span-1 sm:col-span-2">
                                        <el-form-item label="Nome Fantasia" class="!mb-2">
                                            <el-input v-model="newCustomerForm.tradeName" class="enterprise-input" placeholder="Digite o nome fantasia..." />
                                        </el-form-item>
                                    </div>
                                    <div>
                                        <el-form-item :label="newCustomerForm.type === 'PJ' ? 'CNPJ' : 'CPF'"
                                            prop="document" class="!mb-2">
                                            <el-input v-model="newCustomerForm.document" @input="handleDocumentInput"
                                                class="enterprise-input"
                                                :placeholder="newCustomerForm.type === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'"
                                                :maxlength="newCustomerForm.type === 'PF' ? 14 : 18" />
                                        </el-form-item>
                                    </div>
                                    <div>
                                        <el-form-item label="Telefone / WhatsApp (Vinculado)" class="!mb-2">
                                            <el-input v-model="newCustomerForm.phone" disabled class="enterprise-input !bg-slate-50" />
                                        </el-form-item>
                                    </div>
                                    <div>
                                        <el-form-item label="E-mail Principal" class="!mb-2">
                                            <el-input v-model="newCustomerForm.email" class="enterprise-input" placeholder="email@exemplo.com" />
                                        </el-form-item>
                                    </div>
                                    <div>
                                        <el-form-item label="Data de Nascimento / Fundação" class="!mb-2">
                                            <el-date-picker v-model="newCustomerForm.birthDate" type="date"
                                                placeholder="DD/MM/AAAA" format="DD/MM/YYYY" class="!w-full enterprise-input" />
                                        </el-form-item>
                                    </div>
                                </div>
                            </el-tab-pane>

                            <el-tab-pane label="Endereço Fiscal" name="address">
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-12 gap-x-4 gap-y-3 p-6 bg-white h-[320px] overflow-y-auto custom-scroll">
                                    <div class="col-span-1 sm:col-span-4">
                                        <el-form-item label="CEP" class="!mb-2">
                                            <el-input v-model="newCustomerForm.zipCode" class="enterprise-input" placeholder="00000-000"
                                                @blur="fetchCep" />
                                        </el-form-item>
                                    </div>
                                    <div class="col-span-1 sm:col-span-8">
                                        <el-form-item label="Logradouro" class="!mb-2">
                                            <el-input v-model="newCustomerForm.street" class="enterprise-input" placeholder="Rua das Flores" />
                                        </el-form-item>
                                    </div>
                                    <div class="col-span-1 sm:col-span-4">
                                        <el-form-item label="Número" class="!mb-2">
                                            <el-input v-model="newCustomerForm.number" id="numero-input" class="enterprise-input"
                                                placeholder="123" />
                                        </el-form-item>
                                    </div>
                                    <div class="col-span-1 sm:col-span-8">
                                        <el-form-item label="Complemento" class="!mb-2">
                                            <el-input v-model="newCustomerForm.complement" class="enterprise-input" placeholder="Apto 45, Bloco B" />
                                        </el-form-item>
                                    </div>
                                    <div class="col-span-1 sm:col-span-5">
                                        <el-form-item label="Bairro" class="!mb-2">
                                            <el-input v-model="newCustomerForm.neighborhood" class="enterprise-input" placeholder="Centro" />
                                        </el-form-item>
                                    </div>
                                    <div class="col-span-1 sm:col-span-5">
                                        <el-form-item label="Cidade" class="!mb-2">
                                            <el-input v-model="newCustomerForm.city" class="enterprise-input" placeholder="São Paulo" />
                                        </el-form-item>
                                    </div>
                                    <div class="col-span-1 sm:col-span-2">
                                        <el-form-item label="UF" class="!mb-2">
                                            <el-input v-model="newCustomerForm.state" class="enterprise-input" placeholder="SP" maxlength="2" />
                                        </el-form-item>
                                    </div>
                                </div>
                            </el-tab-pane>

                            <el-tab-pane label="Dados Adicionais" name="additional">
                                <div class="p-8 bg-white h-[320px] overflow-y-auto custom-scroll">
                                    <div class="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6 mb-6 flex items-start gap-4">
                                        <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                            <el-icon class="text-blue-600 text-xl"><Flag /></el-icon>
                                        </div>
                                        <div>
                                            <h4 class="text-sm font-bold text-slate-800 mb-1">Classificação de Origem</h4>
                                            <p class="text-xs text-slate-500 leading-relaxed">
                                                Identificar de onde este cliente veio ajuda a medir a eficiência dos seus canais de aquisição (Ex: Instagram, Indicação, Google).
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div class="max-w-md">
                                        <el-form-item label="Origem do Cliente / Lead" class="!mb-2">
                                            <el-select v-model="newCustomerForm.source" class="w-full enterprise-select" filterable
                                                :loading="sourceStore.isLoading" placeholder="Selecione a origem deste lead/cliente...">
                                                <template #prefix><el-icon><Promotion /></el-icon></template>
                                                <el-option v-for="origem in sourceStore.items" :key="origem.id"
                                                    :label="origem.name" :value="origem.name" />
                                            </el-select>
                                        </el-form-item>
                                    </div>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </el-form>
                </div>
            </el-tab-pane>
        </el-tabs>

        <template #footer>
            <div class="flex border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 px-6 py-4 rounded-b-lg justify-end gap-3 mt-4">
                <el-button @click="$emit('close')" class="!rounded-lg !px-6 !font-bold">Cancelar</el-button>
                <el-button type="primary" class="!rounded-lg !px-8 !font-black tracking-wide shadow-md" @click="handleConfirm">
                    {{ activeMainTab === 'link' ? 'Vincular Existente' : 'Criar Novo Registro' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Search, Plus, InfoFilled, Promotion, Flag } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { cepService } from '@/core/services/cep.service';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { useCustomerSourceStore } from '@/modules/customer/ui/store/customer-source.store';
import { formatCustomerNameFromList } from '@/utils/customer';

const props = defineProps<{
    isOpen: boolean;
    contactPhone: string;
    contactName?: string;
    contactAvatar?: string;
}>();

const emit = defineEmits(['close', 'linked']);
const activeInnerTab = ref('personal');
const activeMainTab = ref('link');

const linkForm = reactive({ customerUuid: '', contactName: '' });
const loadingSearch = ref(false);
const searchResults = ref<any[]>([]);

const customerStore = useCustomerStore();
const sourceStore = useCustomerSourceStore();

const newCustomerFormRef = ref<FormInstance>();

const newCustomerForm = reactive({
    type: 'PF',
    name: '',
    tradeName: '',
    document: '',
    phone: '',
    email: '',
    birthDate: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    source: ''
});

const resetDocument = () => { newCustomerForm.document = ''; };

const handleDocumentInput = (val: string) => {
    let v = val.replace(/\D/g, '');
    if (newCustomerForm.type === 'PF') {
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d)/, '$1.$2');
    } else {
        if (v.length > 14) v = v.slice(0, 14);
        if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5');
        else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4');
        else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d)/, '$1.$2.$3');
        else if (v.length > 2) v = v.replace(/(\d{2})(\d)/, '$1.$2');
    }
    newCustomerForm.document = v;
};

const fetchCep = async () => {
    const cep = newCustomerForm.zipCode.replace(/\D/g, '');
    if (cep.length === 8) {
        try {
            const address = await cepService.getAddressByCep(cep);
            newCustomerForm.street = address.logradouro;
            newCustomerForm.neighborhood = address.bairro;
            newCustomerForm.city = address.cidade;
            newCustomerForm.state = address.uf;
            document.getElementById('numero-input')?.focus();
        } catch (e) {
            ElMessage.warning('CEP não encontrado');
        }
    }
};

const formRules = reactive<FormRules>({
    name: [{ required: true, message: 'Nome obrigatório', trigger: 'blur' }]
});

watch(() => props.isOpen, (val) => {
    if (val) {
        sourceStore.fetchSources();

        linkForm.customerUuid = '';
        linkForm.contactName = props.contactName || '';
        searchResults.value = [];
        newCustomerForm.phone = props.contactPhone;
        newCustomerForm.name = props.contactName || '';
        activeInnerTab.value = 'personal';
        activeMainTab.value = 'link';
    }
});

const remoteSearchCustomer = async (query: string) => {
    if (!query) {
        searchResults.value = [];
        return;
    }

    try {
        loadingSearch.value = true;

        if (!customerStore.items || customerStore.items.length === 0) {
            await customerStore.fetch();
        }

        const normalize = (str: string) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const lowerQuery = normalize(query);
        const numberQuery = query.replace(/\D/g, '');

        const results = customerStore.items.filter((c: any) => {
            const name = normalize(formatCustomerNameFromList(c));
            const doc = String(c.document || '').replace(/\D/g, '');
            const phone = String(c.phone || '').replace(/\D/g, '');

            return name.includes(lowerQuery) ||
                (numberQuery && doc.includes(numberQuery)) ||
                (numberQuery && phone.includes(numberQuery));
        });

        searchResults.value = results.map((c: any) => ({
            uuid: c.uuid || c.id,
            name: `${formatCustomerNameFromList(c)} ${c.document ? `(${c.document})` : ''}`
        }));

    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
    } finally {
        loadingSearch.value = false;
    }
};

const handleConfirm = () => {
    if (linkForm.customerUuid) {
        if (!linkForm.contactName || !linkForm.contactName.trim()) {
            ElMessage.warning('Por favor, informe o Nome do Contato antes de vincular.');
            return;
        }
        emit('linked', {
            isNew: false,
            customerUuid: linkForm.customerUuid,
            contactName: linkForm.contactName
        });
    } else {
        if (!newCustomerFormRef.value) return;
        newCustomerFormRef.value.validate((valid) => {
            if (valid) {
                emit('linked', {
                    isNew: true,
                    customerData: { ...newCustomerForm }
                });
            }
        });
    }
};
</script>

<style scoped>
:deep(.enterprise-main-tabs .el-tabs__item) {
    font-size: 14px;
    height: 48px;
    color: #64748b;
}

:deep(.enterprise-main-tabs .el-tabs__item.is-active) {
    color: #4f46e5;
}

:deep(.enterprise-main-tabs .el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: #e2e8f0;
}

:deep(.enterprise-main-tabs .el-tabs__active-bar) {
    background-color: #4f46e5;
    height: 3px;
    border-radius: 3px 3px 0 0;
}

:deep(.enterprise-inner-tabs .el-tabs__item) {
    font-weight: 700;
    font-size: 13px;
    color: #94a3b8;
}

:deep(.enterprise-inner-tabs .el-tabs__item.is-active) {
    color: #3b82f6;
}

:deep(.enterprise-inner-tabs .el-tabs__active-bar) {
    background-color: #3b82f6;
}

:deep(.enterprise-form .el-form-item__label) {
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 6px;
    line-height: 1;
}

:deep(.enterprise-input .el-input__wrapper),
:deep(.enterprise-select .el-select__wrapper) {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px;
    padding: 8px 12px;
    transition: all 0.2s ease;
}

:deep(.enterprise-input .el-input__wrapper.is-focus),
:deep(.enterprise-select .el-select__wrapper.is-focus) {
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
</style>