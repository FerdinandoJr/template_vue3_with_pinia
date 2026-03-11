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
                    class="mt-2 p-0">

                    <el-tabs v-model="activeInnerTab" class="enterprise-tabs px-4">

                        <el-tab-pane label="Dados Pessoais" name="personal">
                            <div class="grid grid-cols-2 gap-4 mt-4 max-h-[320px] overflow-y-auto custom-scroll pr-2">
                                <div class="col-span-2">
                                    <el-form-item label="Tipo" class="!mb-2">
                                        <el-radio-group v-model="newCustomerForm.type" size="default"
                                            @change="resetDocument">
                                            <el-radio-button label="PF" value="PF" />
                                            <el-radio-button label="PJ" value="PJ" />
                                        </el-radio-group>
                                    </el-form-item>
                                </div>

                                <div class="col-span-2">
                                    <el-form-item
                                        :label="newCustomerForm.type === 'PJ' ? 'Razão Social' : 'Nome Completo'"
                                        prop="name" class="!mb-2">
                                        <el-input v-model="newCustomerForm.name" />
                                    </el-form-item>
                                </div>

                                <div v-if="newCustomerForm.type === 'PJ'" class="col-span-2">
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
                            <div class="grid grid-cols-12 gap-4 mt-4 max-h-[320px] overflow-y-auto custom-scroll pr-2">
                                <div class="col-span-4">
                                    <el-form-item label="CEP" class="!mb-2">
                                        <el-input v-model="newCustomerForm.zipCode" placeholder="00000-000"
                                            @blur="fetchCep" />
                                    </el-form-item>
                                </div>

                                <div class="col-span-8">
                                    <el-form-item label="Logradouro" class="!mb-2">
                                        <el-input v-model="newCustomerForm.street" placeholder="Rua das Flores" />
                                    </el-form-item>
                                </div>

                                <div class="col-span-4">
                                    <el-form-item label="Número" class="!mb-2">
                                        <el-input v-model="newCustomerForm.number" id="numero-input"
                                            placeholder="123" />
                                    </el-form-item>
                                </div>

                                <div class="col-span-8">
                                    <el-form-item label="Complemento" class="!mb-2">
                                        <el-input v-model="newCustomerForm.complement" placeholder="Apto 45, Bloco B" />
                                    </el-form-item>
                                </div>

                                <div class="col-span-5">
                                    <el-form-item label="Bairro" class="!mb-2">
                                        <el-input v-model="newCustomerForm.neighborhood" placeholder="Centro" />
                                    </el-form-item>
                                </div>

                                <div class="col-span-5">
                                    <el-form-item label="Cidade" class="!mb-2">
                                        <el-input v-model="newCustomerForm.city" placeholder="São Paulo" />
                                    </el-form-item>
                                </div>

                                <div class="col-span-2">
                                    <el-form-item label="UF" class="!mb-2">
                                        <el-input v-model="newCustomerForm.state" placeholder="SP" maxlength="2" />
                                    </el-form-item>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="Adicionais" name="additional">
                            <div class="grid grid-cols-1 gap-4 mt-4 max-h-[320px] overflow-y-auto custom-scroll pr-2">

                                <div>
                                    <label
                                        class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        Observações Internas
                                    </label>
                                    <el-input v-model="newCustomerForm.notes" type="textarea" :rows="8"
                                        placeholder="Adicione aqui informações cruciais sobre este cliente (ex: melhor horário para ligar, histórico relevante, etc)..."
                                        resize="none" class="enterprise-textarea" />
                                </div>
                            </div>
                        </el-tab-pane>

                    </el-tabs>
                </el-form>
            </el-tab-pane>
        </el-tabs>

        <template #footer>
            <div class="flex justify-end gap-3 mt-2">
                <el-button @click="$emit('close')">Cancelar</el-button>
                <el-button type="primary" @click="submitCRMAction" :loading="loadingSubmit">
                    Salvar e Vincular
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Search, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { cepService } from '@/core/services/cep.service';

const props = defineProps<{
    isOpen: boolean;
    contactPhone: string;
    contactName: string;
    contactAvatar: string;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'linked', customerData: { id: string, name: string, company?: string }): void;
}>();

const customerStore = useCustomerStore();

const linkForm = reactive({ customerUuid: '' });
const newCustomerFormRef = ref<FormInstance>();
const loadingSearch = ref(false);
const searchResults = ref<any[]>([]);
const loadingSubmit = ref(false);
const isLoadingCep = ref(false);

const activeInnerTab = ref('personal');

const newCustomerForm = reactive({
    type: 'PF',
    name: '',
    tradeName: '',
    document: '',
    phone: props.contactPhone || '',
    email: '',
    birthDate: '',
    gender: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    tags: [],
    notes: ''
});

const formRules = reactive<FormRules>({
    name: [{ required: true, message: 'Nome é obrigatório', trigger: 'blur' }],
});

watch(() => props.isOpen, (val) => {
    if (val) {
        linkForm.customerUuid = '';
        searchResults.value = [];
        activeInnerTab.value = 'personal';
        const isNamePhoneNumber = props.contactName?.replace(/\D/g, '') === props.contactPhone?.replace(/\D/g, '');
        newCustomerForm.name = isNamePhoneNumber ? '' : (props.contactName || '');
        newCustomerForm.phone = props.contactPhone || '';
        newCustomerForm.document = '';
        newCustomerForm.email = '';
        newCustomerForm.zipCode = '';
        newCustomerForm.street = '';
        newCustomerForm.number = '';
        newCustomerForm.neighborhood = '';
        newCustomerForm.city = '';
        newCustomerForm.state = '';
        newCustomerForm.notes = '';
    }
});

const resetDocument = () => { newCustomerForm.document = ''; };

const handleDocumentInput = (val: string) => {
    let cleanValue = val.replace(/\D/g, '');
    if (newCustomerForm.type === 'PF') {
        cleanValue = cleanValue.substring(0, 11);
        if (cleanValue.length > 9) cleanValue = cleanValue.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
        else if (cleanValue.length > 6) cleanValue = cleanValue.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
        else if (cleanValue.length > 3) cleanValue = cleanValue.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    } else {
        cleanValue = cleanValue.substring(0, 14);
        if (cleanValue.length > 12) cleanValue = cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2}).*/, '$1.$2.$3/$4-$5');
        else if (cleanValue.length > 8) cleanValue = cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4}).*/, '$1.$2.$3/$4');
        else if (cleanValue.length > 5) cleanValue = cleanValue.replace(/^(\d{2})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
        else if (cleanValue.length > 2) cleanValue = cleanValue.replace(/^(\d{2})(\d{1,3}).*/, '$1.$2');
    }
    newCustomerForm.document = cleanValue;
};

const fetchCep = async () => {
    const cleanCep = newCustomerForm.zipCode.replace(/\D/g, '');

    if (cleanCep.length === 8) {
        isLoadingCep.value = true;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                newCustomerForm.street = data.logradouro;
                newCustomerForm.neighborhood = data.bairro;
                newCustomerForm.city = data.localidade;
                newCustomerForm.state = data.uf;

                setTimeout(() => {
                    document.getElementById('numero-input')?.focus();
                }, 100);

                ElMessage.success('Endereço localizado!');
            } else {
                ElMessage.warning('CEP não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            ElMessage.error('Falha ao consultar serviço de CEP.');
        } finally {
            isLoadingCep.value = false;
        }
    }
};

const remoteSearchCustomer = async (q: string) => {
    if (q) {
        loadingSearch.value = true;
        await customerStore.fetch();
        searchResults.value = customerStore.items.filter((c: any) =>
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
            ElMessage.warning('Verifique os campos obrigatórios.');
            activeInnerTab.value = 'personal';
            return;
        }
    }

    loadingSubmit.value = true;
    try {
        let customerId = linkForm.customerUuid;
        let customerName = '';

        if (!customerId) {
            const newCustomerData = {
                name: newCustomerForm.name,
                companyName: newCustomerForm.type === 'PJ' ? newCustomerForm.name : '',
                document: newCustomerForm.document.replace(/\D/g, ''),
                email: newCustomerForm.email,
                phone: newCustomerForm.phone,
                zipCode: newCustomerForm.zipCode,
                street: newCustomerForm.street,
                number: newCustomerForm.number,
                neighborhood: newCustomerForm.neighborhood,
                city: newCustomerForm.city,
                state: newCustomerForm.state,
            };
            await customerStore.createCustomer(newCustomerData as any);
            const created = customerStore.items[0];
            if (created) {
                customerId = created.uuid;
                customerName = created.name;
            }
        } else {
            const found = searchResults.value.find(c => c.uuid === customerId);
            customerName = found?.name || 'Cliente Vinculado';
        }

        if (customerId) {
            emit('linked', { id: customerId, name: customerName || newCustomerForm.name });
        }
    } catch (error) {
        ElMessage.error('Erro ao vincular cliente');
    } finally {
        loadingSubmit.value = false;
    }
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

:deep(.enterprise-tabs .el-tabs__item) {
    font-weight: 600;
    font-size: 13px;
}

:deep(.enterprise-tabs .el-tabs__active-bar) {
    background-color: #3b82f6;
}
</style>