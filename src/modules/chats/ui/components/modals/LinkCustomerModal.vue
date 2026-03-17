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

        <el-tabs type="border-card" class="shadow-sm">
            <el-tab-pane>
                <template #label>
                    <span class="flex items-center gap-2">
                        <el-icon>
                            <Search />
                        </el-icon> Vincular Existente
                    </span>
                </template>
                <el-form label-position="top" class="mt-4 p-4">
                    <el-form-item label="Buscar Cliente na Base">
                        <el-select v-model="linkForm.customerUuid" filterable remote
                            :remote-method="remoteSearchCustomer" :loading="loadingSearch" class="w-full"
                            placeholder="Digite Nome, Razão Social, Telefone ou CPF/CNPJ..." size="large">
                            <el-option v-for="item in searchResults" :key="item.uuid" :label="item.name"
                                :value="item.uuid" />
                        </el-select>
                        <p class="text-xs text-slate-400 mt-2">Selecione um cliente já registado para vincular a este
                            número.</p>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane>
                <template #label>
                    <span class="flex items-center gap-2">
                        <el-icon>
                            <Plus />
                        </el-icon> Novo Registo Completo
                    </span>
                </template>
                <el-form ref="newCustomerFormRef" :model="newCustomerForm" :rules="formRules" label-position="top"
                    class="mt-2 p-0">
                    <el-tabs v-model="activeInnerTab" class="enterprise-tabs px-4">
                        <el-tab-pane label="Dados Pessoais" name="personal">
                            <div
                                class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-h-[320px] overflow-y-auto custom-scroll pr-2">
                                <div class="col-span-1 sm:col-span-2">
                                    <el-form-item label="Tipo" class="!mb-2">
                                        <el-radio-group v-model="newCustomerForm.type" size="default"
                                            @change="resetDocument">
                                            <el-radio-button label="PF" value="PF" />
                                            <el-radio-button label="PJ" value="PJ" />
                                        </el-radio-group>
                                    </el-form-item>
                                </div>
                                <div class="col-span-1 sm:col-span-2">
                                    <el-form-item
                                        :label="newCustomerForm.type === 'PJ' ? 'Razão Social' : 'Nome Completo'"
                                        prop="name" class="!mb-2">
                                        <el-input v-model="newCustomerForm.name" />
                                    </el-form-item>
                                </div>
                                <div v-if="newCustomerForm.type === 'PJ'" class="col-span-1 sm:col-span-2">
                                    <el-form-item label="Nome Fantasia" class="!mb-2">
                                        <el-input v-model="newCustomerForm.tradeName" />
                                    </el-form-item>
                                </div>
                                <div>
                                    <el-form-item :label="newCustomerForm.type === 'PJ' ? 'CNPJ' : 'CPF'"
                                        prop="document" class="!mb-2">
                                        <el-input v-model="newCustomerForm.document" @input="handleDocumentInput"
                                            :placeholder="newCustomerForm.type === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'"
                                            :maxlength="newCustomerForm.type === 'PF' ? 14 : 18" />
                                    </el-form-item>
                                </div>
                                <div>
                                    <el-form-item label="Telefone / WhatsApp (Vinculado)" class="!mb-2">
                                        <el-input v-model="newCustomerForm.phone" disabled class="bg-slate-50" />
                                    </el-form-item>
                                </div>
                                <div>
                                    <el-form-item label="E-mail" class="!mb-2">
                                        <el-input v-model="newCustomerForm.email" placeholder="email@exemplo.com" />
                                    </el-form-item>
                                </div>
                                <div>
                                    <el-form-item label="Nascimento" class="!mb-2">
                                        <el-date-picker v-model="newCustomerForm.birthDate" type="date"
                                            placeholder="DD/MM/AAAA" format="DD/MM/YYYY" class="!w-full" />
                                    </el-form-item>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Endereço" name="address">
                            <div
                                class="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4 max-h-[320px] overflow-y-auto custom-scroll pr-2">
                                <div class="col-span-1 sm:col-span-4">
                                    <el-form-item label="CEP" class="!mb-2">
                                        <el-input v-model="newCustomerForm.zipCode" placeholder="00000-000"
                                            @blur="fetchCep" />
                                    </el-form-item>
                                </div>
                                <div class="col-span-1 sm:col-span-8">
                                    <el-form-item label="Logradouro" class="!mb-2">
                                        <el-input v-model="newCustomerForm.street" placeholder="Rua das Flores" />
                                    </el-form-item>
                                </div>
                                <div class="col-span-1 sm:col-span-4">
                                    <el-form-item label="Número" class="!mb-2">
                                        <el-input v-model="newCustomerForm.number" id="numero-input"
                                            placeholder="123" />
                                    </el-form-item>
                                </div>
                                <div class="col-span-1 sm:col-span-8">
                                    <el-form-item label="Complemento" class="!mb-2">
                                        <el-input v-model="newCustomerForm.complement" placeholder="Apto 45, Bloco B" />
                                    </el-form-item>
                                </div>
                                <div class="col-span-1 sm:col-span-5">
                                    <el-form-item label="Bairro" class="!mb-2">
                                        <el-input v-model="newCustomerForm.neighborhood" placeholder="Centro" />
                                    </el-form-item>
                                </div>
                                <div class="col-span-1 sm:col-span-5">
                                    <el-form-item label="Cidade" class="!mb-2">
                                        <el-input v-model="newCustomerForm.city" placeholder="São Paulo" />
                                    </el-form-item>
                                </div>
                                <div class="col-span-1 sm:col-span-2">
                                    <el-form-item label="UF" class="!mb-2">
                                        <el-input v-model="newCustomerForm.state" placeholder="SP" maxlength="2" />
                                    </el-form-item>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-form>
            </el-tab-pane>
        </el-tabs>

        <template #footer>
            <div class="flex justify-end gap-3 pt-4">
                <el-button @click="$emit('close')">Cancelar</el-button>
                <el-button type="primary" class="!font-bold" @click="handleConfirm">
                    Salvar
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Search, Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { cepService } from '@/core/services/cep.service';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';

const props = defineProps<{
    isOpen: boolean;
    contactPhone: string;
    contactName?: string;
    contactAvatar?: string;
}>();

const emit = defineEmits(['close', 'linked']);
const activeInnerTab = ref('personal');

const linkForm = reactive({ customerUuid: '' });
const loadingSearch = ref(false);
const searchResults = ref<any[]>([]);

const customerStore = useCustomerStore();
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
    group: ''
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
        linkForm.customerUuid = '';
        searchResults.value = [];
        newCustomerForm.phone = props.contactPhone;
        newCustomerForm.name = props.contactName || '';
        activeInnerTab.value = 'personal';
    }
});

// FUNÇÃO CORRIGIDA PARA EVITAR ERRO DE 'VOID' NO TYPESCRIPT
const remoteSearchCustomer = async (query: string) => {
    if (!query) {
        searchResults.value = [];
        return;
    }

    try {
        loadingSearch.value = true;

        // Se a store estiver vazia, chama o fetch
        if (!customerStore.items || customerStore.items.length === 0) {
            console.log('Buscando clientes na base...');
            await customerStore.fetch(); // Removido o teste de truthiness do retorno void
        }

        // Normalização para busca
        const normalize = (str: string) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const lowerQuery = normalize(query);
        const numberQuery = query.replace(/\D/g, '');

        // Filtra os itens que agora devem estar na store
        const results = customerStore.items.filter((c: any) => {
            const name = normalize(c.tradeName || c.companyName || c.name);
            const doc = String(c.document || '').replace(/\D/g, '');
            const phone = String(c.phone || '').replace(/\D/g, '');

            return name.includes(lowerQuery) ||
                (numberQuery && doc.includes(numberQuery)) ||
                (numberQuery && phone.includes(numberQuery));
        });

        console.log(`Busca por "${query}" retornou ${results.length} resultados.`);

        searchResults.value = results.map((c: any) => ({
            uuid: c.uuid || c.id,
            name: `${c.tradeName || c.companyName || c.name} ${c.document ? `(${c.document})` : ''}`
        }));

    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
    } finally {
        loadingSearch.value = false;
    }
};

const handleConfirm = () => {
    if (linkForm.customerUuid) {
        emit('linked', {
            isNew: false,
            customerUuid: linkForm.customerUuid
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
:deep(.enterprise-tabs .el-tabs__item) {
    font-weight: 600;
    color: #64748b;
}

:deep(.enterprise-tabs .el-tabs__item.is-active) {
    color: #2563eb;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
</style>