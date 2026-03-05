<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && $emit('close')" title="Gestão de Identidade (CRM)"
        width="850px" align-center destroy-on-close class="rounded-lg custom-dialog">
        <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
            <el-avatar :size="50" :src="contactAvatar" class="bg-blue-100 text-blue-600 font-bold text-xl">
                {{ contactName?.charAt(0).toUpperCase() || '?' }}
            </el-avatar>
            <div>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Contato no WhatsApp</p>
                <h3 class="font-bold text-slate-800 text-lg">{{ contactName }}</h3>
                <p class="text-sm text-slate-600 font-mono">{{ contactPhone }}</p>
            </div>
        </div>

        <el-tabs type="border-card" class="shadow-sm">
            <el-tab-pane>
                <template #label><span class="flex items-center gap-2"><el-icon>
                            <Search />
                        </el-icon> Vincular Existente</span></template>
                <el-form label-position="top" class="mt-4 p-4">
                    <el-form-item label="Buscar Cliente na Base">
                        <el-select v-model="linkForm.customerUuid" filterable remote
                            :remote-method="remoteSearchCustomer" :loading="loadingSearch" class="w-full"
                            placeholder="Digite Nome, Razão Social ou CPF/CNPJ...">
                            <el-option v-for="item in searchResults" :key="item.uuid" :label="item.name"
                                :value="item.uuid" />
                        </el-select>
                        <p class="text-xs text-slate-400 mt-2">Selecione um cliente já cadastrado para vincular a este
                            número.</p>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

            <el-tab-pane>
                <template #label><span class="flex items-center gap-2"><el-icon>
                            <Plus />
                        </el-icon> Novo Cadastro Completo</span></template>

                <el-form ref="newCustomerFormRef" :model="newCustomerForm" :rules="formRules" label-position="top"
                    class="mt-2 p-4 max-h-[450px] overflow-y-auto overflow-x-hidden custom-scroll">
                    <div class="mb-6">
                        <h4
                            class="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                            Dados da Empresa / Pessoa</h4>
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <el-form-item label="Tipo">
                                    <el-radio-group v-model="newCustomerForm.type" size="default" class="w-full"
                                        @change="resetDocument">
                                        <el-radio-button label="PF" value="PF" />
                                        <el-radio-button label="PJ" value="PJ" />
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="18">
                                <el-form-item :label="newCustomerForm.type === 'PJ' ? 'CNPJ' : 'CPF'" prop="document">
                                    <el-input v-model="newCustomerForm.document" @input="handleDocumentInput"
                                        :placeholder="newCustomerForm.type === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'"
                                        :maxlength="newCustomerForm.type === 'PF' ? 14 : 18" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item :label="newCustomerForm.type === 'PJ' ? 'Razão Social' : 'Nome Completo'"
                                    prop="name">
                                    <el-input v-model="newCustomerForm.name" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="newCustomerForm.type === 'PJ' ? 'Nome Fantasia' : 'Apelido'">
                                    <el-input v-model="newCustomerForm.tradeName" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>

                    <div class="mb-6">
                        <h4
                            class="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                            Canais de Contato</h4>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="Telefone / WhatsApp (Vinculado)">
                                    <el-input v-model="newCustomerForm.phone" disabled class="bg-slate-50">
                                        <template #prefix><el-icon>
                                                <Phone />
                                            </el-icon></template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="E-mail Principal" prop="email">
                                    <el-input v-model="newCustomerForm.email" placeholder="email@exemplo.com">
                                        <template #prefix><el-icon>
                                                <Message />
                                            </el-icon></template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>

                    <div class="mb-2">
                        <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                            <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest">Endereço</h4>
                            <span v-if="isLoadingCep" class="text-xs text-blue-500 font-medium flex items-center gap-1">
                                <el-icon class="is-loading">
                                    <Loading />
                                </el-icon> Buscando...
                            </span>
                        </div>
                        <el-row :gutter="15">
                            <el-col :span="6">
                                <el-form-item label="CEP">
                                    <el-input v-model="newCustomerForm.zipCode" @blur="fetchCep"
                                        placeholder="00000-000">
                                        <template #append>
                                            <el-button @click="fetchCep"><el-icon>
                                                    <Search />
                                                </el-icon></el-button>
                                        </template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="Logradouro">
                                    <el-input v-model="newCustomerForm.street" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="Número">
                                    <el-input v-model="newCustomerForm.number" id="numero-input" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="15">
                            <el-col :span="10">
                                <el-form-item label="Bairro">
                                    <el-input v-model="newCustomerForm.neighborhood" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="10">
                                <el-form-item label="Cidade">
                                    <el-input v-model="newCustomerForm.city" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">
                                <el-form-item label="UF">
                                    <el-input v-model="newCustomerForm.state" maxlength="2" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </el-form>
            </el-tab-pane>
        </el-tabs>

        <template #footer>
            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <el-button @click="$emit('close')">Cancelar</el-button>
                <el-button type="primary" @click="submitCRMAction" :loading="loadingSubmit" class="!font-bold">
                    Confirmar e Vincular
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { Search, Plus, Phone, Message, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { cepService } from '@/core/services/cep.service';
import { isValidCpfCnpj } from '@/util/helpers';

const props = defineProps<{
    isOpen: boolean;
    contactPhone: string;
    contactName: string;
    contactAvatar: string;
}>();

const emit = defineEmits(['close', 'linked']);
const customerStore = useCustomerStore();

const linkForm = reactive({ customerUuid: '' });
const searchResults = ref<any[]>([]);

const newCustomerFormRef = ref<FormInstance>();
const newCustomerForm = reactive({
    type: 'PF', document: '', name: '', tradeName: '', phone: '', email: '',
    zipCode: '', street: '', number: '', neighborhood: '', city: '', state: ''
});

const loadingSearch = ref(false);
const loadingSubmit = ref(false);
const isLoadingCep = ref(false);

// ===============================================
// TRAVA 3: VALIDAÇÃO RESTRITA POR TIPO
// ===============================================
const checkDocument = (rule: any, value: string, callback: any) => {
    const cleanValue = value ? value.replace(/\D/g, '') : '';

    if (!cleanValue) {
        callback();
        return;
    }

    // Verifica se a quantidade de dígitos bate com a escolha
    if (newCustomerForm.type === 'PF' && cleanValue.length !== 11) {
        callback(new Error('Um CPF precisa ter exatamente 11 números.'));
        return;
    }

    if (newCustomerForm.type === 'PJ' && cleanValue.length !== 14) {
        callback(new Error('Um CNPJ precisa ter exatamente 14 números.'));
        return;
    }

    // Se passou no tamanho, verifica a matemática
    if (!isValidCpfCnpj(value)) {
        callback(new Error(newCustomerForm.type === 'PJ' ? 'Este CNPJ é inválido.' : 'Este CPF é inválido.'));
    } else {
        callback();
    }
};

const formRules = reactive<FormRules>({
    name: [{ required: true, message: 'O nome é obrigatório', trigger: 'blur' }],
    document: [{ validator: checkDocument, trigger: 'blur' }],
    email: [{ type: 'email', message: 'E-mail inválido', trigger: 'blur' }]
});

// ===============================================
// TRAVA 2: MÁSCARA FORÇADA DE ACORDO COM O TIPO
// ===============================================
const handleDocumentInput = (value: string) => {
    let v = value.replace(/\D/g, ''); // Limpa tudo o que não for número

    if (newCustomerForm.type === 'PF') {
        // Força máscara de CPF
        v = v.substring(0, 11);
        newCustomerForm.document = v
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // Força máscara de CNPJ
        v = v.substring(0, 14);
        newCustomerForm.document = v
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
};

const resetDocument = () => {
    newCustomerForm.document = '';
    newCustomerFormRef.value?.clearValidate('document');
};

watch(() => props.isOpen, (val) => {
    if (val) {
        newCustomerForm.phone = props.contactPhone;
        newCustomerForm.name = props.contactName === props.contactPhone ? '' : props.contactName;
        newCustomerForm.tradeName = '';
        newCustomerForm.document = '';
        newCustomerForm.email = '';
        newCustomerForm.zipCode = '';
        newCustomerForm.street = '';
        newCustomerForm.number = '';
        newCustomerForm.neighborhood = '';
        newCustomerForm.city = '';
        newCustomerForm.state = '';
        linkForm.customerUuid = '';
        searchResults.value = [];

        setTimeout(() => newCustomerFormRef.value?.clearValidate(), 50);
    }
});

const fetchCep = async () => {
    const cleanCep = newCustomerForm.zipCode?.replace(/\D/g, '') || '';
    if (cleanCep.length === 8) {
        isLoadingCep.value = true;
        try {
            const address = await cepService.getAddressByCep(cleanCep);
            newCustomerForm.street = address.logradouro;
            newCustomerForm.neighborhood = address.bairro;
            newCustomerForm.city = address.cidade;
            newCustomerForm.state = address.uf;
            setTimeout(() => document.getElementById('numero-input')?.focus(), 100);
        } catch (error) {
            ElMessage.warning('CEP não encontrado.');
        } finally {
            isLoadingCep.value = false;
        }
    }
};

const remoteSearchCustomer = async (q: string) => {
    if (q) {
        loadingSearch.value = true;
        await customerStore.fetch();
        searchResults.value = customerStore.items.filter(c =>
            c.name.toLowerCase().includes(q.toLowerCase()) ||
            (c.companyName && c.companyName.toLowerCase().includes(q.toLowerCase()))
        );
        loadingSearch.value = false;
    }
};

const submitCRMAction = async () => {
    if (!linkForm.customerUuid) {
        if (!newCustomerFormRef.value) return;
        const isValid = await newCustomerFormRef.value.validate().catch(() => false);

        if (!isValid) {
            ElMessage.warning('Verifique os campos em vermelho antes de salvar.');
            return;
        }
    }

    loadingSubmit.value = true;
    try {
        let customerId = linkForm.customerUuid;
        let customerName = '';
        let customerCompany = '';

        if (!customerId) {
            const newCustomerData = {
                name: newCustomerForm.name,
                companyName: newCustomerForm.type === 'PJ' ? newCustomerForm.name : '',
                tradeName: newCustomerForm.tradeName,
                document: newCustomerForm.document.replace(/\D/g, ''),
                email: newCustomerForm.email,
                phone: newCustomerForm.phone,
                status: 'active',
                source: 'WhatsApp',
                avatar: newCustomerForm.name.substring(0, 2).toUpperCase(),
                zipCode: newCustomerForm.zipCode,
                street: newCustomerForm.street,
                number: newCustomerForm.number,
                neighborhood: newCustomerForm.neighborhood,
                city: newCustomerForm.city,
                state: newCustomerForm.state,
                website: '',
                complement: ''
            };
            await customerStore.createCustomer(newCustomerData as any);
            const created = customerStore.items[0];
            if (created) {
                customerId = created.uuid;
                customerName = created.name;
                customerCompany = created.companyName;
            }
        } else {
            const found = searchResults.value.find(c => c.uuid === customerId);
            customerName = found?.name || 'Cliente Vinculado';
        }

        if (customerId) {
            emit('linked', {
                id: customerId,
                name: customerName || newCustomerForm.name,
                company: customerCompany || newCustomerForm.tradeName
            });
        } else {
            ElMessage.error('Erro ao identificar cliente criado.');
        }
    } catch (error) {
        ElMessage.error('Erro ao vincular.');
    } finally {
        loadingSubmit.value = false;
    }
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}
</style>