<template>
    <el-dialog :model-value="isOpen" title="Gerenciar Origens de Clientes" width="95%" style="max-width: 500px;"
        @close="$emit('close')" destroy-on-close align-center class="rounded-xl overflow-hidden">

        <div class="mb-6">
            <p class="text-sm text-slate-500">
                Cadastre os canais por onde os seus clientes chegam até você. Isso ajudará a gerar relatórios precisos
                no futuro.
            </p>
        </div>

        <div class="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <el-input v-model="newSourceName" placeholder="Ex: Google Ads, TikTok, Feira de Eventos..."
                @keyup.enter="handleAdd" size="large" class="flex-1" />
            <el-button type="primary" @click="handleAdd" size="large" class="!font-bold !px-6">
                <el-icon class="mr-2">
                    <Plus />
                </el-icon> Adicionar
            </el-button>
        </div>

        <div class="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-2 relative"
            v-loading="sourceStore.isLoading">

            <div v-for="source in sourceStore.items" :key="source.id"
                class="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-blue-300 transition-all group">

                <div v-if="editingId === source.id" class="flex-1 flex items-center gap-2 mr-2">
                    <el-input v-model="editName" size="default" @keyup.enter="handleSaveEdit(source.id)" autofocus />
                    <el-button type="success" @click="handleSaveEdit(source.id)" plain title="Salvar">
                        <el-icon>
                            <Check />
                        </el-icon>
                    </el-button>
                    <el-button type="info" @click="cancelEdit" plain title="Cancelar">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </el-button>
                </div>

                <div v-else class="flex-1 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                        <el-icon>
                            <Connection />
                        </el-icon>
                    </div>
                    <span class="font-bold text-slate-700">{{ source.name }}</span>
                </div>

                <div v-if="editingId !== source.id"
                    class="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <el-button type="primary" circle plain size="small" @click="startEdit(source)"
                        title="Editar Origem">
                        <el-icon>
                            <Edit />
                        </el-icon>
                    </el-button>
                    <el-button type="danger" circle plain size="small" @click="handleDelete(source.id)"
                        title="Remover Origem">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </div>

            <div v-if="!sourceStore.isLoading && sourceStore.items.length === 0"
                class="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <el-icon class="text-4xl text-slate-300 mb-2">
                    <Connection />
                </el-icon>
                <p class="text-slate-500 font-medium">Nenhuma origem cadastrada.</p>
                <p class="text-xs text-slate-400 mt-1">Utilize o campo acima para adicionar a primeira.</p>
            </div>
        </div>

    </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCustomerSourceStore } from '../store/customer-source.store';
import { Connection, Edit, Delete, Plus, Check, Close } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close']);
const sourceStore = useCustomerSourceStore();
const newSourceName = ref('');
const editingId = ref<string | null>(null);
const editName = ref('');

onMounted(() => {
    if (props.isOpen) {
        sourceStore.fetchSources();
    }
});

const handleAdd = async () => {
    if (!newSourceName.value.trim()) {
        ElMessage.warning('Por favor, digite o nome da origem.');
        return;
    }

    const success = await sourceStore.addSource(newSourceName.value);
    if (success) {
        newSourceName.value = '';
        ElMessage.success('Origem cadastrada com sucesso!');
    }
};

const startEdit = (source: any) => {
    editingId.value = source.id;
    editName.value = source.name;
};

const cancelEdit = () => {
    editingId.value = null;
    editName.value = '';
};

const handleSaveEdit = async (id: string) => {
    if (!editName.value.trim()) {
        cancelEdit();
        return;
    }

    const success = await sourceStore.updateSource(id, editName.value);
    if (success) {
        cancelEdit();
        ElMessage.success('Origem atualizada!');
    }
};

const handleDelete = (id: string) => {
    ElMessageBox.confirm(
        'Tem certeza que deseja remover esta origem? Isso não afetará os clientes que já estão vinculados a ela, apenas impedirá novas seleções.',
        'Atenção',
        {
            confirmButtonText: 'Sim, Remover',
            cancelButtonText: 'Cancelar',
            type: 'warning',
        }
    ).then(async () => {
        const success = await sourceStore.deleteSource(id);
        if (success) {
            ElMessage.success('Origem removida da lista.');
        }
    }).catch(() => { });
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
}
</style>