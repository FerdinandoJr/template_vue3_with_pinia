<template>
    <el-dialog :model-value="isOpen" title="Novo Atendimento" width="95%" style="max-width: 500px;"
        @close="$emit('close')" destroy-on-close align-center>
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
            <el-form-item label="Cliente / Contato" prop="customerName">
                <el-select v-model="form.customerName" filterable placeholder="Selecione o Cliente..." size="large"
                    class="w-full">
                    <el-option v-for="client in customerStore.items" :key="client.id"
                        :label="client.tradeName || client.companyName || client.name"
                        :value="client.tradeName || client.companyName || client.name" />
                </el-select>
            </el-form-item>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-4">
                <el-form-item label="Assunto" prop="subject">
                    <el-input v-model="form.subject" placeholder="Ex: Suporte de Acesso" />
                </el-form-item>
                <el-form-item label="Prioridade" prop="priority">
                    <el-select v-model="form.priority" class="w-full">
                        <el-option label="Baixa" value="low" />
                        <el-option label="Média" value="medium" />
                        <el-option label="Alta" value="high" />
                        <el-option label="Urgente" value="urgent" />
                    </el-select>
                </el-form-item>
            </div>

            <el-form-item label="Descrição Breve" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Detalhes do chamado..."
                    resize="none" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="flex flex-col sm:flex-row justify-end gap-3">
                <el-button @click="$emit('close')" class="w-full sm:w-auto !ml-0">Cancelar</el-button>
                <el-button type="primary" class="!font-bold w-full sm:w-auto !ml-0" @click="submit">Gerar Protocolo e
                    Iniciar</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import type { FormInstance } from 'element-plus';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'create']);
const formRef = ref<FormInstance>();

const customerStore = useCustomerStore();

onMounted(() => {
    if (customerStore.items.length === 0) {
        customerStore.fetch();
    }
});

const form = reactive({
    customerName: '',
    subject: '',
    priority: 'medium',
    description: ''
});

const rules = {
    customerName: [{ required: true, message: 'Obrigatório', trigger: 'change' }],
    subject: [{ required: true, message: 'Obrigatório', trigger: 'blur' }]
};

const submit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate((valid) => {
        if (valid) {
            emit('create', { ...form });
            formRef.value?.resetFields();
        }
    });
};
</script>