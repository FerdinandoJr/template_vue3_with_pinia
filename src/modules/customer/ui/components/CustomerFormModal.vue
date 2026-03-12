<template>
    <el-dialog :model-value="isOpen" @update:model-value="(val: boolean) => !val && $emit('close')"
        :title="isEditing ? 'Editar Registo' : 'Novo Registo'" width="800px" destroy-on-close align-center
        class="customer-modal">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="custom-form">
            <el-tabs v-model="activeTab" class="w-full mt-2">

                <el-tab-pane :label="form.type === 'PJ' ? 'Dados da Empresa' : 'Dados Pessoais'" name="empresa">

                    <div class="pt-4 mb-2">
                        <el-form-item>
                            <el-radio-group v-model="form.type" @change="resetDocument">
                                <el-radio-button label="PJ">Pessoa Jurídica (CNPJ)</el-radio-button>
                                <el-radio-button label="PF">Pessoa Física (CPF)</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <el-form-item :label="form.type === 'PJ' ? 'Razão Social' : 'Nome Completo'" prop="companyName">
                            <el-input v-model="form.companyName" />
                        </el-form-item>

                        <el-form-item v-if="form.type === 'PJ'" label="Nome Fantasia">
                            <el-input v-model="form.tradeName" />
                        </el-form-item>

                        <el-form-item :label="form.type === 'PJ' ? 'CNPJ' : 'CPF'" prop="document">
                            <el-input v-model="form.document" @input="handleDocumentInput"
                                :placeholder="form.type === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'" />
                        </el-form-item>

                        <el-form-item label="Site">
                            <el-input v-model="form.website" />
                        </el-form-item>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="Endereço Comercial" name="endereco">
                    <div class="flex justify-between items-center mb-2 pt-2">
                        <span v-if="isLoadingCep" class="text-xs text-blue-500 font-medium flex items-center gap-1">
                            <el-icon class="is-loading">
                                <Loading />
                            </el-icon> A pesquisar código postal...
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <el-form-item label="Código Postal" class="md:col-span-2">
                            <el-input v-model="form.zipCode" maxlength="9" @blur="fetchCep" />
                        </el-form-item>
                        <el-form-item label="Morada" class="md:col-span-3">
                            <el-input v-model="form.street" />
                        </el-form-item>
                        <el-form-item label="Número" class="md:col-span-1">
                            <el-input v-model="form.number" id="numero-input" />
                        </el-form-item>
                        <el-form-item label="Complemento" class="md:col-span-3">
                            <el-input v-model="form.complement" />
                        </el-form-item>
                        <el-form-item label="Bairro" class="md:col-span-3">
                            <el-input v-model="form.neighborhood" />
                        </el-form-item>
                        <el-form-item label="Localidade" class="md:col-span-4">
                            <el-input v-model="form.city" />
                        </el-form-item>
                        <el-form-item label="Estado / Distrito" class="md:col-span-2">
                            <el-input v-model="form.state" maxlength="2" class="uppercase-input" />
                        </el-form-item>
                    </div>
                </el-tab-pane>

                <el-tab-pane label="Contacto Principal" name="contato">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <el-form-item label="Nome do Contacto" required class="md:col-span-2">
                            <el-input v-model="form.name" />
                        </el-form-item>

                        <el-form-item label="Telefone / WhatsApp" prop="phone">
                            <el-input v-model="form.phone" @input="handlePhoneInput" placeholder="(00) 00000-0000"
                                maxlength="15" />
                        </el-form-item>

                        <el-form-item label="E-mail" required>
                            <el-input v-model="form.email" />
                        </el-form-item>
                        <el-form-item label="Estado">
                            <el-select v-model="form.status" class="w-full">
                                <el-option label="Ativo" value="active" />
                                <el-option label="Inativo" value="inactive" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Origem da Lead">
                            <el-select v-model="form.source" class="w-full">
                                <el-option label="WhatsApp" value="WhatsApp" />
                                <el-option label="Instagram" value="Instagram" />
                                <el-option label="Site" value="Site" />
                                <el-option label="Referência" value="Indicação" />
                            </el-select>
                        </el-form-item>
                    </div>
                </el-tab-pane>

            </el-tabs>
        </el-form>

        <template #footer>
            <div class="dialog-footer flex justify-end gap-2 border-t border-slate-100 pt-4">
                <el-button @click="$emit('close')">Cancelar</el-button>
                <el-button type="primary" @click="handleSave">Salvar</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ICustomer } from '../../domain/entities/customer'

const props = defineProps<{
    isOpen: boolean;
    customerData: Partial<ICustomer> | null;
}>()

const emit = defineEmits(['close', 'save'])

const formRef = ref<FormInstance>()
const isEditing = computed(() => !!props.customerData && !!props.customerData.uuid)
const isLoadingCep = ref(false)
const activeTab = ref('empresa')

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
    source: 'WhatsApp',
    avatar: ''
})

const validateDocument = (rule: any, value: string, callback: any) => {
    if (!value) {
        callback(new Error(form.type === 'PF' ? 'O CPF é obrigatório' : 'O CNPJ é obrigatório'))
        return
    }

    const cleanValue = value.replace(/\D/g, '')

    if (form.type === 'PF') {
        if (cleanValue.length !== 11) {
            callback(new Error('CPF incompleto'))
            return
        }
        if (/^(\d)\1{10}$/.test(cleanValue)) {
            callback(new Error('CPF inválido'))
            return
        }
        let sum = 0, rest
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanValue.substring(i - 1, i)) * (11 - i)
        rest = (sum * 10) % 11
        if ((rest === 10) || (rest === 11)) rest = 0
        if (rest !== parseInt(cleanValue.substring(9, 10))) { callback(new Error('CPF inválido')); return; }

        sum = 0
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanValue.substring(i - 1, i)) * (12 - i)
        rest = (sum * 10) % 11
        if ((rest === 10) || (rest === 11)) rest = 0
        if (rest !== parseInt(cleanValue.substring(10, 11))) { callback(new Error('CPF inválido')); return; }

        callback()
    } else {
        if (cleanValue.length !== 14) {
            callback(new Error('CNPJ incompleto'))
            return
        }
        if (/^(\d)\1{13}$/.test(cleanValue)) {
            callback(new Error('CNPJ inválido'))
            return
        }
        let size = cleanValue.length - 2
        let numbers = cleanValue.substring(0, size)
        const digits = cleanValue.substring(size)
        let sum = 0
        let pos = size - 7
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--
            if (pos < 2) pos = 9
        }
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11
        if (result !== parseInt(digits.charAt(0))) { callback(new Error('CNPJ inválido')); return; }

        size = size + 1
        numbers = cleanValue.substring(0, size)
        sum = 0
        pos = size - 7
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--
            if (pos < 2) pos = 9
        }
        result = sum % 11 < 2 ? 0 : 11 - sum % 11
        if (result !== parseInt(digits.charAt(1))) { callback(new Error('CNPJ inválido')); return; }

        callback()
    }
}

const validatePhone = (rule: any, value: string, callback: any) => {
    if (!value) {
        callback(new Error('O Telefone/WhatsApp é obrigatório'))
        return
    }

    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue.length < 10) {
        callback(new Error('Número de telefone incompleto ou inválido'))
        return
    }

    callback()
}

const rules = reactive<FormRules>({
    companyName: [{ required: true, message: 'Nome / Razão Social é obrigatório', trigger: 'blur' }],
    document: [
        { required: true, message: 'O Documento é obrigatório', trigger: 'blur' },
        { validator: validateDocument, trigger: 'blur' }
    ],
    phone: [{ validator: validatePhone, trigger: 'blur' }]
})

const handleDocumentInput = (val: string) => {
    let cleanValue = val.replace(/\D/g, '')
    if (form.type === 'PF') {
        cleanValue = cleanValue.substring(0, 11)
        if (cleanValue.length > 9) cleanValue = cleanValue.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4')
        else if (cleanValue.length > 6) cleanValue = cleanValue.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3')
        else if (cleanValue.length > 3) cleanValue = cleanValue.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2')
    } else {
        cleanValue = cleanValue.substring(0, 14)
        if (cleanValue.length > 12) cleanValue = cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2}).*/, '$1.$2.$3/$4-$5')
        else if (cleanValue.length > 8) cleanValue = cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4}).*/, '$1.$2.$3/$4')
        else if (cleanValue.length > 5) cleanValue = cleanValue.replace(/^(\d{2})(\d{3})(\d{1,3}).*/, '$1.$2.$3')
        else if (cleanValue.length > 2) cleanValue = cleanValue.replace(/^(\d{2})(\d{1,3}).*/, '$1.$2')
    }
    form.document = cleanValue
}

const handlePhoneInput = (val: string) => {
    let cleanValue = val.replace(/\D/g, '')
    cleanValue = cleanValue.substring(0, 11)

    if (cleanValue.length > 10) {
        cleanValue = cleanValue.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (cleanValue.length > 6) {
        cleanValue = cleanValue.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (cleanValue.length > 2) {
        cleanValue = cleanValue.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    } else if (cleanValue.length > 0) {
        cleanValue = cleanValue.replace(/^(\d{0,2})/, '($1')
    }

    form.phone = cleanValue
}

const resetDocument = () => {
    form.document = ''
    formRef.value?.clearValidate('document')
}

const fetchCep = async () => {
    const cleanCep = form.zipCode?.replace(/\D/g, '') || ''
    if (cleanCep.length === 8) {
        isLoadingCep.value = true
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
            const data = await response.json()
            if (!data.erro) {
                form.street = data.logradouro
                form.neighborhood = data.bairro
                form.city = data.localidade
                form.state = data.uf
                nextTick(() => document.getElementById('numero-input')?.focus())
            }
        } catch (error) {
            console.error("Erro ao pesquisar CEP", error)
        } finally {
            isLoadingCep.value = false
        }
    }
}

watch(() => form.zipCode, (newVal) => {
    if (newVal && newVal.replace(/\D/g, '').length === 8) {
        fetchCep()
    }
})

watch(() => props.isOpen, (val) => {
    if (val) {
        activeTab.value = 'empresa'
        setTimeout(() => formRef.value?.clearValidate(), 100)
    }
})

const initFormData = () => {
    if (props.customerData) {
        const docNumbers = props.customerData.document?.replace(/\D/g, '').length || 0;
        const initialType = docNumbers === 11 ? 'PF' : 'PJ';

        Object.assign(form, {
            uuid: props.customerData.uuid || '',
            type: initialType,
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
            status: props.customerData.status || 'active',
            source: props.customerData.source || 'WhatsApp',
            avatar: props.customerData.avatar || ''
        })
    } else {
        Object.assign(form, {
            uuid: '', type: 'PJ', name: '', companyName: '', tradeName: '', document: '',
            website: '', zipCode: '', street: '', number: '', complement: '',
            neighborhood: '', city: '', state: '', phone: '', email: '',
            status: 'active', source: 'WhatsApp', avatar: ''
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
            emit('save', { ...form })
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
</style>