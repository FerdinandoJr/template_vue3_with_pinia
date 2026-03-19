<template>
    <el-dialog :model-value="isOpen" :title="form.uuid ? 'Editar Registo' : 'Novo Registo'" width="95%"
        style="max-width: 800px;" @close="$emit('close')" destroy-on-close align-center
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
                                    ||
                                form.name?.charAt(0).toUpperCase() || '?' }}
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

                            <el-form-item v-if="form.type === 'PF'" label="Nome Completo" prop="name">
                                <el-input v-model="form.name" placeholder="Nome completo do cliente..."
                                    class="uppercase-input" />
                            </el-form-item>

                            <el-form-item :label="form.type === 'PJ' ? 'CNPJ' : 'CPF'" prop="document">
                                <el-input v-model="form.document" @input="handleDocumentInput"
                                    :placeholder="form.type === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'"
                                    :maxlength="form.type === 'PF' ? 14 : 18" />
                            </el-form-item>

                            <el-form-item label="Telefone / WhatsApp" prop="phone">
                                <el-input v-model="form.phone" @input="handlePhoneInput" placeholder="(00) 00000-0000"
                                    maxlength="15" />
                            </el-form-item>

                            <el-form-item label="E-mail de Contato" prop="email">
                                <el-input v-model="form.email" placeholder="email@empresa.com" />
                            </el-form-item>

                            <el-form-item label="Origem do Cliente" prop="source">
                                <el-select v-model="form.source" placeholder="Selecione a origem..." class="w-full"
                                    filterable :loading="sourceStore.isLoading">
                                    <el-option v-for="origem in sourceStore.items" :key="origem.id" :label="origem.name"
                                        :value="origem.name" />
                                </el-select>
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="Endereço" name="address">
                    <div class="py-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
                            <el-form-item label="CEP" prop="zipCode">
                                <el-input v-model="form.zipCode" @input="handleCepInput" placeholder="00000-000"
                                    maxlength="9" :loading="isFetchingCep">
                                    <template v-if="isFetchingCep" #suffix>
                                        <el-icon class="is-loading">
                                            <Loading />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Cidade" prop="city">
                                <el-input v-model="form.city" placeholder="Nome da cidade..." />
                            </el-form-item>
                            <el-form-item label="UF" prop="state">
                                <el-input v-model="form.state" placeholder="EX: SP, SC, RJ" maxlength="2"
                                    class="uppercase-input" />
                            </el-form-item>
                            <el-form-item label="Rua / Logradouro" prop="street" class="md:col-span-2">
                                <el-input v-model="form.street" placeholder="Nome da rua, avenida..." />
                            </el-form-item>
                            <el-form-item label="Número" prop="number">
                                <el-input v-model="form.number" placeholder="123" />
                            </el-form-item>
                            <el-form-item label="Bairro" prop="neighborhood" class="md:col-span-2">
                                <el-input v-model="form.neighborhood" placeholder="Nome do bairro..." />
                            </el-form-item>
                            <el-form-item label="Complemento" prop="complement">
                                <el-input v-model="form.complement" placeholder="Apto, Sala..." />
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-form>

        <template #footer>
            <div class="flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                <el-button @click="$emit('close')" size="large" class="w-full sm:w-auto">Cancelar</el-button>
                <el-button type="primary" @click="handleSave" size="large" class="!font-bold w-full sm:w-auto">Salvar
                    Cadastro</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

// Importação corrigida de acordo com o seu projeto!
import { useCustomerSourceStore } from '../store/customer-source.store'

const props = defineProps<{ isOpen: boolean; customerData?: any }>()
const emit = defineEmits(['close', 'save'])

const formRef = ref<any>()
const activeTab = ref('general')
const isFetchingCep = ref(false)

// Instancia da Store Oficial de Origens
const sourceStore = useCustomerSourceStore()

const form = reactive({
    uuid: '',
    type: 'PJ',
    name: '',
    companyName: '',
    tradeName: '',
    document: '',
    website: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    status: 'active',
    source: '',
    avatar: '',
    contacts: []
})

const rules = {
    companyName: [{ required: true, message: 'Obrigatório para PJ', trigger: 'blur' }],
    name: [{ required: true, message: 'Obrigatório para PF', trigger: 'blur' }],
    document: [{ required: true, message: 'Obrigatório', trigger: 'blur' }]
}

const resetDocument = () => {
    form.document = ''
}

// MÁSCARA DE CPF E CNPJ
const handleDocumentInput = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (form.type === 'PF') {
        if (v.length > 11) v = v.slice(0, 11)
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4')
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3')
        else if (v.length > 3) v = v.replace(/(\d{3})(\d)/, '$1.$2')
    } else {
        if (v.length > 14) v = v.slice(0, 14)
        if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5')
        else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4')
        else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d)/, '$1.$2.$3')
        else if (v.length > 2) v = v.replace(/(\d{2})(\d)/, '$1.$2')
    }
    form.document = v
}

// MÁSCARA DE TELEFONE
const handlePhoneInput = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (v.length > 5) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    }
    form.phone = v
}

// MÁSCARA DE CEP
const handleCepInput = async (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 8) v = v.slice(0, 8)
    if (v.length > 5) {
        v = v.replace(/^(\d{5})(\d{1,3})/, '$1-$2')
    }
    form.zipCode = v

    const rawCep = v.replace(/\D/g, '')
    if (rawCep.length === 8) {
        await fetchAddressByCep(rawCep)
    }
}

// BUSCA VIACEP
const fetchAddressByCep = async (cep: string) => {
    isFetchingCep.value = true
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
            form.street = data.logradouro || ''
            form.neighborhood = data.bairro || ''
            form.city = data.localidade || ''
            form.state = data.uf || ''
            ElMessage.success('Endereço preenchido com sucesso!')
        } else {
            ElMessage.warning('CEP não encontrado.')
        }
    } catch (error) {
        ElMessage.error('Erro ao buscar o CEP na internet.')
    } finally {
        isFetchingCep.value = false
    }
}

const initFormData = () => {
    if (props.customerData) {
        Object.assign(form, props.customerData)

        // Força a máscara aos dados carregados do banco
        if (form.phone) handlePhoneInput(form.phone)
        if (form.document) handleDocumentInput(form.document)
        if (form.zipCode) {
            let v = form.zipCode.replace(/\D/g, '')
            if (v.length > 5) v = v.replace(/^(\d{5})(\d{1,3})/, '$1-$2')
            form.zipCode = v
        }
    } else {
        Object.assign(form, {
            uuid: '', type: 'PJ', name: '', companyName: '', tradeName: '', document: '',
            website: '', zipCode: '', street: '', number: '', complement: '', neighborhood: '',
            city: '', state: '', phone: '', email: '', status: 'active', source: '',
            avatar: '', contacts: []
        })
    }
}

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        // Garante que a lista de origens é sempre carregada ao abrir o modal
        sourceStore.fetchSources()
        initFormData()
        activeTab.value = 'general'
    }
}, { immediate: true })

const handleSave = async () => {
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
            emit('save', { ...form })
        } else {
            ElMessage.warning('Por favor, preencha todos os campos obrigatórios.')
            if (!form.name && !form.companyName || !form.document) {
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
    min-height: 480px;
    display: flex;
    flex-direction: column;
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