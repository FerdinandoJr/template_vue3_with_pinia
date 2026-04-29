<template>
    <el-dialog :model-value="isOpen" :title="form.uuid ? 'Editar Registo' : 'Novo Registo'" width="95%"
        style="max-width: 800px;" @close="$emit('close')" destroy-on-close align-center append-to-body
        class="rounded-xl overflow-hidden">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="mt-4" size="large"
            require-asterisk-position="right">
            <el-tabs v-model="activeTab" class="enterprise-tabs px-6">

                <el-tab-pane label="Geral" name="general">
                    <div class="py-4 flex flex-col h-full">
                        <div
                            class="flex flex-col sm:flex-row items-center gap-6 mb-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full box-border">
                            <el-avatar :size="70"
                                class="bg-blue-600 text-white font-black text-2xl shadow-md flex-shrink-0">
                                {{ form.tradeName?.charAt(0).toUpperCase() || form.companyName?.charAt(0).toUpperCase()
                                    || form.name?.charAt(0).toUpperCase() || '?' }}
                            </el-avatar>
                            <div class="flex-1 w-full overflow-hidden p-1 -m-1">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo de
                                    Cliente</p>
                                <el-radio-group v-model="form.type" size="large"
                                    class="w-full flex flex-col sm:flex-row gap-2 custom-radio-group"
                                    @change="resetDocument">
                                    <el-radio-button value="PJ" class="flex-1 w-full">Pessoa Jurídica</el-radio-button>
                                    <el-radio-button value="PF" class="flex-1 w-full">Pessoa Física</el-radio-button>
                                </el-radio-group>
                            </div>
                            <div
                                class="w-full sm:w-auto flex flex-col items-center sm:items-start p-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
                                <el-switch v-model="form.status" active-value="active" inactive-value="inactive"
                                    active-text="Ativo" inactive-text="Inativo" inline-prompt width="70"
                                    style="--el-switch-on-color: #10b981; --el-switch-off-color: #ef4444" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item v-if="form.type === 'PJ'" label="Razão Social" prop="companyName">
                                <el-input v-model="form.companyName" placeholder="Nome oficial da empresa..."
                                    class="uppercase-input" />
                            </el-form-item>
                            <el-form-item v-if="form.type === 'PJ'" label="Nome Fantasia" prop="tradeName">
                                <el-input v-model="form.tradeName" placeholder="Como a empresa é conhecida..."
                                    class="uppercase-input" />
                            </el-form-item>
                            <el-form-item v-if="form.type === 'PJ'" label="Nome do Responsável" prop="responsibleName">
                                <el-input v-model="form.responsibleName" placeholder="Nome completo do responsável..."
                                    class="uppercase-input" />
                            </el-form-item>
                            <el-form-item v-if="form.type === 'PF'" label="Nome Completo" prop="name">
                                <el-input v-model="form.name" placeholder="Nome completo do cliente..."
                                    class="uppercase-input" />
                            </el-form-item>
                            <el-form-item :label="form.type === 'PJ' ? 'CNPJ' : 'CPF'" prop="document">
                                <el-input v-model="form.document" @input="handleDocumentInput"
                                    :placeholder="form.type === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'"
                                    :maxlength="form.type === 'PF' ? 14 : 18" />
                            </el-form-item>
                        </div>

                        <div
                            class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-4 border-t border-slate-100 pt-6">
                            <el-form-item label="E-mail Principal" prop="email">
                                <el-input v-model="form.email" placeholder="contato@empresa.com" type="email">
                                    <template #prefix>
                                        <el-icon>
                                            <Message />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Telefone Principal" prop="phone">
                                <el-input v-model="form.phone" @input="handlePhoneInput" placeholder="(00) 00000-0000"
                                    maxlength="15">
                                    <template #prefix>
                                        <el-icon>
                                            <Phone />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Site / Redes Sociais" prop="website">
                                <el-input v-model="form.website" placeholder="www.empresa.com.br">
                                    <template #prefix>
                                        <el-icon>
                                            <Link />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Origem do Cliente" prop="source">
                                <div class="flex gap-2 w-full items-center">
                                    <el-select v-model="form.source" class="flex-1" filterable
                                        :loading="sourceStore.isLoading" placeholder="Como este cliente nos encontrou?">
                                        <template #prefix><el-icon>
                                                <Promotion />
                                            </el-icon></template>
                                        <el-option v-for="origem in sourceStore.items" :key="origem.id"
                                            :label="origem.name" :value="origem.name" />
                                    </el-select>
                                    <el-button circle plain type="info" @click="isSourceModalOpen = true"
                                        title="Gerenciar Origens" class="!border-slate-300 flex-shrink-0">
                                        <el-icon>
                                            <Setting />
                                        </el-icon>
                                    </el-button>
                                </div>
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="Endereço" name="address">
                    <div class="py-4">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-2">
                            <el-form-item label="CEP" prop="zipCode" class="md:col-span-4">
                                <el-input v-model="form.zipCode" @input="handleZipCodeInput" placeholder="00000-000"
                                    maxlength="9">
                                    <template #suffix>
                                        <el-icon v-if="loadingCep" class="is-loading">
                                            <Loading />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Rua / Logradouro" prop="street" class="md:col-span-8">
                                <el-input v-model="form.street" placeholder="Nome da rua, avenida..." />
                            </el-form-item>
                            <el-form-item label="Número" prop="number" class="md:col-span-4">
                                <el-input v-model="form.number" placeholder="123" ref="numberInputRef" />
                            </el-form-item>
                            <el-form-item label="Complemento" prop="complement" class="md:col-span-4">
                                <el-input v-model="form.complement" placeholder="Sala, Apto, Bloco..." />
                            </el-form-item>
                            <el-form-item label="Bairro" prop="neighborhood" class="md:col-span-4">
                                <el-input v-model="form.neighborhood" placeholder="Nome do bairro" />
                            </el-form-item>
                            <el-form-item label="Cidade" prop="city" class="md:col-span-8">
                                <el-input v-model="form.city" placeholder="Nome da cidade" />
                            </el-form-item>
                            <el-form-item label="UF" prop="state" class="md:col-span-4">
                                <el-select v-model="form.state" placeholder="Estado" class="w-full">
                                    <el-option v-for="uf in ufs" :key="uf" :label="uf" :value="uf" />
                                </el-select>
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-form>

        <template #footer>
            <div class="flex justify-between items-center w-full px-2 pt-4 border-t border-slate-100">
                <div class="text-xs text-slate-400 flex items-center gap-1.5 font-medium hidden sm:flex">
                    <el-icon class="text-blue-500">
                        <InfoFilled />
                    </el-icon>
                    Os campos com asterisco vermelho são obrigatórios.
                </div>
                <div class="flex gap-3 w-full sm:w-auto justify-end">
                    <el-button @click="$emit('close')" size="large" class="!px-6">Cancelar</el-button>
                    <el-button type="primary" @click="submit" size="large"
                        class="!font-bold shadow-md shadow-blue-200 !px-8">
                        {{ form.uuid ? 'Salvar Alterações' : 'Criar Registo' }}
                    </el-button>
                </div>
            </div>
        </template>

        <CustomerSourceSettingsModal :is-open="isSourceModalOpen" @close="isSourceModalOpen = false" />
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Message, Phone, Link, Promotion, InfoFilled, Loading, Setting } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useCepLocator } from '@/core/composables/useCepLocator'
import type { ICustomer } from '../../domain/entities/customer'
import { useCustomerSourceStore } from '../store/customer-source.store'
import CustomerSourceSettingsModal from './CustomerSourceSettingsModal.vue'
import { cepService } from '@/core/services/cep.service'

const props = defineProps<{
    isOpen: boolean
    customerData?: Partial<ICustomer> | null
}>()

const emit = defineEmits(['close', 'save'])
const formRef = ref<FormInstance>()
const activeTab = ref('general')
const numberInputRef = ref()
const sourceStore = useCustomerSourceStore()
const isSourceModalOpen = ref(false)

const form = reactive({
    uuid: '',
    type: 'PJ',
    name: '',
    companyName: '',
    tradeName: '',
    responsibleName: '',
    document: '',
    email: '',
    phone: '',
    website: '',
    status: 'active',
    source: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    avatar: ''
})

const { loadingCep, formatAndSearchCep } = useCepLocator()

const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

onMounted(() => {
    if (props.isOpen) {
        sourceStore.fetchSources()
    }
})

watch([() => props.isOpen, () => props.customerData], ([val, data]) => {
    if (val && data) {
        activeTab.value = 'general'
        if (formRef.value) formRef.value.clearValidate()
        sourceStore.fetchSources()

        if (props.customerData && props.customerData.id) {
            form.uuid = props.customerData.id || ''
            form.name = props.customerData.name || ''
            form.companyName = props.customerData.companyName || ''
            form.tradeName = props.customerData.tradeName || ''
            form.responsibleName = props.customerData.responsibleName || ''
            form.document = props.customerData.document || ''
            form.email = props.customerData.email || ''
            form.phone = props.customerData.phone || ''
            form.website = props.customerData.website || ''
            form.status = props.customerData.status || 'active'
            form.source = props.customerData.source || ''
            form.zipCode = props.customerData.zipCode || ''
            form.street = props.customerData.street || ''
            form.number = props.customerData.number || ''
            form.complement = props.customerData.complement || ''
            form.neighborhood = props.customerData.neighborhood || ''
            form.city = props.customerData.city || ''
            form.state = props.customerData.state || ''
            form.avatar = props.customerData.avatar || ''

            if (form.companyName && !form.name) {
                form.type = 'PJ'
            } else if (form.name && !form.companyName) {
                form.type = 'PF'
            } else {
                form.type = 'PJ'
            }
            } else if (data && !data.id) {
            form.uuid = ''
            form.type = 'PJ'
            form.name = ''
            form.companyName = ''
            form.tradeName = ''
            form.responsibleName = ''
            form.document = ''
            form.email = ''
            form.phone = ''
            form.website = ''
            form.status = 'active'
            form.source = ''
            form.zipCode = ''
            form.street = ''
            form.number = ''
            form.complement = ''
            form.neighborhood = ''
            form.city = ''
            form.state = ''
            form.avatar = ''
        }
    }
}, { immediate: true })

const resetDocument = () => {
    form.document = ''
}

const handleDocumentInput = (val: string | undefined) => {
    let v = (val || '').replace(/\D/g, '')
    if (form.type === 'PF') {
        if (v.length > 11) v = v.slice(0, 11)
        if (v.length > 9) {
            v = v.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4')
        } else if (v.length > 6) {
            v = v.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3')
        } else if (v.length > 3) {
            v = v.replace(/(\d{3})(\d)/, '$1.$2')
        }
    } else {
        if (v.length > 14) v = v.slice(0, 14)
        if (v.length > 12) {
            v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5')
        } else if (v.length > 8) {
            v = v.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4')
        } else if (v.length > 5) {
            v = v.replace(/(\d{2})(\d{3})(\d)/, '$1.$2.$3')
        } else if (v.length > 2) {
            v = v.replace(/(\d{2})(\d)/, '$1.$2')
        }
    }
    form.document = v
}

const handlePhoneInput = (val: string | undefined) => {
    let v = (val || '').replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    }
    form.phone = v
}

const handleZipCodeInput = async (val: string | undefined) => {
    const v = val || '';
    const cleaned = v.replace(/\D/g, '');
    
    if (cleaned.length === 8) {
        try {
            const address = await cepService.getAddressByCep(cleaned);
            form.street = address.logradouro || '';
            form.neighborhood = address.bairro || '';
            form.city = address.cidade || '';
            form.state = address.uf || '';
            ElMessage.success('Endereço preenchido!');
            setTimeout(() => {
                numberInputRef.value?.focus()
            }, 100)
        } catch (error) {
            ElMessage.warning('CEP não encontrado');
        }
    }
    
    let formatted = cleaned;
    if (formatted.length > 5) {
        formatted = formatted.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    form.zipCode = formatted;
}

const validateDocument = (rule: any, value: string | undefined, callback: any) => {
    if (!value) {
        callback(new Error('O documento é obrigatório'))
    } else {
        const cleanValue = value.replace(/\D/g, '')
        if (form.type === 'PF' && cleanValue.length !== 11) {
            callback(new Error('CPF inválido'))
        } else if (form.type === 'PJ' && cleanValue.length !== 14) {
            callback(new Error('CNPJ inválido'))
        } else {
            callback()
        }
    }
}

const rules = reactive<FormRules>({
    companyName: [{ required: true, message: 'Razão Social obrigatória', trigger: 'blur' }],
    document: [{ validator: validateDocument, trigger: 'blur' }],
    email: [{ type: 'email', message: 'E-mail inválido', trigger: 'blur' }]
})

const submit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid: boolean) => {
        if (valid) {
            if (!form.avatar) {
                const initials = form.tradeName || form.companyName || form.name || 'CL'
                form.avatar = initials.substring(0, 2).toUpperCase()
            }

            if (form.type === 'PJ' && form.name && !form.companyName) {
                form.companyName = form.name;
            }

            const { uuid, ...formRest } = form;
            const payload = {
                id: uuid,
                ...formRest
            };
            emit('save', payload)
        } else {
            ElMessage.warning('Por favor, preencha todos os campos obrigatórios.')
            if ((!form.name && !form.companyName) || !form.document) {
                activeTab.value = 'general'
            }
        }
    })
}
</script>

<style scoped>
.uppercase-input :deep(input) {
    text-transform: uppercase;
}

:deep(.el-tabs__item) {
    font-weight: 600;
    color: #64748b;
}

:deep(.el-tabs__item.is-active) {
    color: #2563eb;
}

:deep(.el-tabs__active-bar) {
    background-color: #2563eb;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}

:deep(.custom-radio-group) {
    display: flex;
    width: 100%;
}

:deep(.custom-radio-group .el-radio-button) {
    flex: 1;
}

:deep(.custom-radio-group .el-radio-button__inner) {
    width: 100% !important;
}

:deep(.el-tabs__content) {
    height: 520px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

:deep(.el-tabs__content)::-webkit-scrollbar {
    width: 6px;
}

:deep(.el-tabs__content)::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}

:deep(.el-tab-pane) {
    flex-grow: 1;
}

.is-loading {
    animation: rotating 2s linear infinite;
}

@keyframes rotating {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>