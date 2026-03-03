<template>
    <el-dialog :model-value="isOpen" @update:model-value="(val: boolean) => !val && $emit('close')"
        :title="isEditing ? 'Editar Cadastro' : 'Novo Cadastro'" width="800px" destroy-on-close align-center
        class="customer-modal">
        <el-form :model="form" label-position="top" class="custom-form">

            <div class="mb-6">
                <h4 class="text-sm font-bold text-blue-600 border-b border-slate-100 pb-2 mb-4">Dados da Empresa</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <el-form-item label="Razão Social" required>
                        <el-input v-model="form.companyName" />
                    </el-form-item>
                    <el-form-item label="Nome Fantasia">
                        <el-input v-model="form.tradeName" />
                    </el-form-item>
                    <el-form-item label="CNPJ / CPF">
                        <el-input v-model="form.document" />
                    </el-form-item>
                    <el-form-item label="Site">
                        <el-input v-model="form.website" />
                    </el-form-item>
                </div>
            </div>

            <div class="mb-6">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                    <h4 class="text-sm font-bold text-blue-600">Endereço Comercial</h4>
                    <span v-if="isLoadingCep" class="text-xs text-blue-500 font-medium flex items-center gap-1">
                        <el-icon class="is-loading">
                            <Loading />
                        </el-icon> Buscando CEP...
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <el-form-item label="CEP" class="md:col-span-2">
                        <el-input v-model="form.zipCode" maxlength="9" @blur="fetchCep" />
                    </el-form-item>
                    <el-form-item label="Logradouro" class="md:col-span-3">
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
                    <el-form-item label="Cidade" class="md:col-span-4">
                        <el-input v-model="form.city" />
                    </el-form-item>
                    <el-form-item label="Estado (UF)" class="md:col-span-2">
                        <el-input v-model="form.state" maxlength="2" class="uppercase-input" />
                    </el-form-item>
                </div>
            </div>

            <div>
                <h4 class="text-sm font-bold text-blue-600 border-b border-slate-100 pb-2 mb-4">Contato Principal</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <el-form-item label="Nome do Contato" required class="md:col-span-2">
                        <el-input v-model="form.name" />
                    </el-form-item>
                    <el-form-item label="Telefone / WhatsApp" required>
                        <el-input v-model="form.phone" />
                    </el-form-item>
                    <el-form-item label="E-mail" required>
                        <el-input v-model="form.email" />
                    </el-form-item>
                    <el-form-item label="Status">
                        <el-select v-model="form.status" class="w-full">
                            <el-option label="Ativo" value="active" />
                            <el-option label="Inativo" value="inactive" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Origem do Lead">
                        <el-select v-model="form.source" class="w-full">
                            <el-option label="WhatsApp" value="WhatsApp" />
                            <el-option label="Instagram" value="Instagram" />
                            <el-option label="Site" value="Site" />
                            <el-option label="Indicação" value="Indicação" />
                        </el-select>
                    </el-form-item>
                </div>
            </div>
        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="$emit('close')">Cancelar</el-button>
                <el-button type="primary" @click="handleSave">Salvar</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, nextTick, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import type { ICustomer } from '../../domain/entities/customer'

const props = defineProps<{
    isOpen: boolean;
    customerData: Partial<ICustomer> | null;
}>()

const emit = defineEmits(['close', 'save'])

const isLoadingCep = ref(false)
const isEditing = computed(() => !!props.customerData && !!props.customerData.uuid)

const form = reactive({
    uuid: '',
    name: '', companyName: '', tradeName: '', document: '', website: '',
    zipCode: '', street: '', number: '', complement: '', neighborhood: '',
    city: '', state: '', phone: '', email: '',
    status: 'active', source: 'WhatsApp', avatar: ''
})

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
            console.error("Erro ao buscar CEP", error)
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

const initFormData = () => {
    if (props.customerData) {
        Object.assign(form, {
            uuid: props.customerData.uuid || '',
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
            uuid: '', name: '', companyName: '', tradeName: '', document: '', website: '',
            zipCode: '', street: '', number: '', complement: '', neighborhood: '',
            city: '', state: '', phone: '', email: '',
            status: 'active', source: 'WhatsApp', avatar: ''
        })
    }
}

watch(() => props.customerData, () => {
    initFormData()
}, { immediate: true, deep: true })

const handleSave = () => {
    if (!form.avatar) {
        const initials = form.tradeName || form.companyName || 'EM'
        form.avatar = initials.substring(0, 2).toUpperCase()
    }
    emit('save', { ...form })
}
</script>

<style scoped>
.uppercase-input :deep(input) {
    text-transform: uppercase;
}
</style>