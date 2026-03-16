<template>
    <el-dialog :model-value="isOpen" :title="form.uuid ? 'Editar Cadastro' : 'Novo Cadastro'" width="95%"
        style="max-width: 800px;" @close="$emit('close')" destroy-on-close align-center
        class="rounded-xl overflow-hidden">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="mt-4"
            require-asterisk-position="right">
            <el-tabs v-model="activeTab" class="enterprise-tabs px-6">
                <el-tab-pane label="Geral" name="general">
                    <div class="py-4">
                        <div class="flex items-center gap-6 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <el-avatar :size="70" class="bg-blue-600 text-white font-black text-2xl shadow-md">
                                {{ form.tradeName?.charAt(0).toUpperCase() || form.companyName?.charAt(0).toUpperCase()
                                    || form.name?.charAt(0).toUpperCase() || '?' }}
                            </el-avatar>
                            <div class="flex-1">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo de
                                    Cliente</p>
                                <el-radio-group v-model="form.type" size="large" @change="resetDocument">
                                    <el-radio-button value="PJ">Pessoa Jurídica</el-radio-button>
                                    <el-radio-button value="PF">Pessoa Física</el-radio-button>
                                </el-radio-group>
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
                                    :placeholder="form.type === 'PJ' ? '00.000.000/0001-00' : '000.000.000-00'" />
                            </el-form-item>

                            <el-form-item label="Telefone / WhatsApp" prop="phone">
                                <el-input v-model="form.phone" @input="handlePhoneInput" placeholder="(00) 00000-0000"
                                    maxlength="15" />
                            </el-form-item>

                            <el-form-item label="E-mail" prop="email">
                                <el-input v-model="form.email" placeholder="contato@empresa.com" type="email" />
                            </el-form-item>

                            <el-form-item v-if="form.type === 'PJ'" label="Website (Opcional)" prop="website">
                                <el-input v-model="form.website" placeholder="www.empresa.com.br">
                                    <template #prepend>https://</template>
                                </el-input>
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="Endereço" name="address">
                    <div class="py-4">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-2">
                            <el-form-item label="CEP" prop="zipCode" class="md:col-span-4">
                                <el-input v-model="form.zipCode" @input="handleCepInput" @blur="fetchCep"
                                    placeholder="00000-000" maxlength="9">
                                    <template #append>
                                        <el-button @click="fetchCep" :icon="Search" />
                                    </template>
                                </el-input>
                            </el-form-item>

                            <el-form-item label="Endereço (Rua, Av, etc)" prop="street" class="md:col-span-8">
                                <el-input v-model="form.street" placeholder="Logradouro..." class="uppercase-input" />
                            </el-form-item>

                            <el-form-item label="Número" prop="number" class="md:col-span-3">
                                <el-input id="numero-input" v-model="form.number" placeholder="123"
                                    class="uppercase-input" />
                            </el-form-item>

                            <el-form-item label="Complemento" prop="complement" class="md:col-span-4">
                                <el-input v-model="form.complement" placeholder="Sala, Apto..."
                                    class="uppercase-input" />
                            </el-form-item>

                            <el-form-item label="Bairro" prop="neighborhood" class="md:col-span-5">
                                <el-input v-model="form.neighborhood" placeholder="Bairro..." class="uppercase-input" />
                            </el-form-item>

                            <el-form-item label="Cidade" prop="city" class="md:col-span-8">
                                <el-input v-model="form.city" placeholder="Cidade..." class="uppercase-input" />
                            </el-form-item>

                            <el-form-item label="Estado (UF)" prop="state" class="md:col-span-4">
                                <el-select v-model="form.state" placeholder="Selecione..." class="w-full">
                                    <el-option
                                        v-for="uf in ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']"
                                        :key="uf" :label="uf" :value="uf" />
                                </el-select>
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="Sistema" name="settings">
                    <div class="py-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <el-form-item label="Origem do Cliente" prop="source">
                                <el-select v-model="form.source" class="w-full">
                                    <el-option label="WhatsApp" value="WhatsApp" />
                                    <el-option label="Site / Landing Page" value="Site" />
                                    <el-option label="Indicação" value="Indicação" />
                                    <el-option label="Instagram" value="Instagram" />
                                    <el-option label="Outro" value="Outro" />
                                </el-select>
                            </el-form-item>

                            <el-form-item label="Status Inicial" prop="status">
                                <el-radio-group v-model="form.status" class="w-full">
                                    <el-radio-button value="active" class="flex-1 text-center">Ativo</el-radio-button>
                                    <el-radio-button value="inactive"
                                        class="flex-1 text-center">Inativo</el-radio-button>
                                    <el-radio-button value="lead" class="flex-1 text-center">Lead</el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-form>

        <template #footer>
            <div class="flex justify-end gap-3 px-2 pb-2">
                <el-button @click="$emit('close')" class="!px-6 !rounded-lg">Cancelar</el-button>
                <el-button type="primary" @click="handleSave" class="!px-8 !rounded-lg !font-bold">
                    {{ form.uuid ? 'Salvar Alterações' : 'Cadastrar Cliente' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { cepService } from '@/core/services/cep.service'

const props = defineProps<{
    isOpen: boolean
    customerData?: any
}>()

const emit = defineEmits(['close', 'save'])

const formRef = ref<FormInstance>()
const activeTab = ref('general')

const form = reactive({
    uuid: '',
    type: 'PJ', // 'PF' ou 'PJ'
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
    source: 'WhatsApp',
    avatar: ''
})

const checkCpfCnpj = (rule: any, value: string, callback: any) => {
    if (!value) {
        return callback()
    }
    const cleanValue = value.replace(/\D/g, '')
    if (form.type === 'PF' && cleanValue.length !== 11) {
        callback(new Error('CPF inválido. Deve conter 11 dígitos.'))
    } else if (form.type === 'PJ' && cleanValue.length !== 14) {
        callback(new Error('CNPJ inválido. Deve conter 14 dígitos.'))
    } else {
        callback()
    }
}

const checkPhone = (rule: any, value: string, callback: any) => {
    if (!value) {
        if (rule.required) callback(new Error('O telefone é obrigatório'))
        return
    }
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length < 10) {
        callback(new Error('Telefone inválido. Insira o DDD + Número'))
    } else {
        callback()
    }
}

const rules = reactive<FormRules>({
    name: [{ required: true, message: 'Nome é obrigatório', trigger: 'blur' }],
    document: [
        { required: true, message: 'Documento é obrigatório', trigger: 'blur' },
        { validator: checkCpfCnpj, trigger: 'blur' }
    ],
    // Adicionando a regra do telefone e email
    phone: [
        { required: true, message: 'Telefone é obrigatório', trigger: 'blur' },
        { validator: checkPhone, trigger: 'blur' }
    ],
    email: [
        { type: 'email', message: 'Insira um e-mail válido', trigger: ['blur', 'change'] }
    ]
})

const resetDocument = () => {
    form.document = ''
}

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

// Formatação do Telefone em tempo real
const handlePhoneInput = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)

    if (v.length > 10) {
        // Formato de Celular: (00) 00000-0000
        v = v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (v.length > 6) {
        // Formato de Fixo: (00) 0000-0000
        v = v.replace(/(\d{2})(\d{4})(\d)/, '($1) $2-$3')
    } else if (v.length > 2) {
        // Formato incompleto: (00) 000...
        v = v.replace(/(\d{2})(\d)/, '($1) $2')
    }
    form.phone = v
}

const handleCepInput = (val: string) => {
    let v = val.replace(/\D/g, '')
    if (v.length > 8) v = v.slice(0, 8)
    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2')
    form.zipCode = v
}

const fetchCep = async () => {
    if (!form.zipCode || form.zipCode.length < 8) return
    try {
        const addr = await cepService.getAddressByCep(form.zipCode)
        form.street = addr.logradouro.toUpperCase()
        form.neighborhood = addr.bairro.toUpperCase()
        form.city = addr.cidade.toUpperCase()
        form.state = addr.uf.toUpperCase()
        setTimeout(() => {
            document.getElementById('numero-input')?.focus()
        }, 100)
        ElMessage.success('Endereço preenchido automaticamente!')
    } catch (error) {
        ElMessage.warning('CEP não localizado.')
    }
}

// ADICIONADO: Função para formatar o telefone ao carregar os dados
const applyPhoneMask = (val?: string) => {
    if (!val) return '';
    let v = val.replace(/\D/g, '');
    if (v.length <= 10) {
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
        v = v.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return v.substring(0, 15);
};

const initFormData = () => {
    if (props.customerData) {
        Object.assign(form, {
            ...props.customerData,
            type: props.customerData.document?.length && props.customerData.document.length > 14 ? 'PJ' : 'PF',
            name: props.customerData.name || props.customerData.companyName || ''
        })

        // ADICIONADO: Aplica a máscara logo após preencher os dados no formulário
        if (form.phone) form.phone = applyPhoneMask(form.phone);

    } else {
        Object.assign(form, {
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
            source: 'WhatsApp',
            avatar: ''
        })
    }
}

watch(() => props.customerData, () => {
    initFormData()
}, { immediate: true, deep: true })

const handleSave = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
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
            ElMessage.warning('Por favor, preencha todos os campos obrigatórios em vermelho.')
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
</style>