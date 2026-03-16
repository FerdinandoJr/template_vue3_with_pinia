<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && $emit('close')" title="Gerir Assuntos / Categorias"
        width="95%" style="max-width: 500px;" destroy-on-close align-center class="rounded-xl">
        <div class="mb-6 flex gap-2">
            <el-input v-model="newCategory" placeholder="Nome do novo assunto (ex: Financeiro)" size="large"
                @keyup.enter="handleAdd">
                <template #prefix><el-icon>
                        <Collection />
                    </el-icon></template>
            </el-input>
            <el-button type="primary" size="large" @click="handleAdd" :disabled="!newCategory.trim()">
                Adicionar
            </el-button>
        </div>
        <div class="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-[300px] overflow-y-auto">
            <div v-for="cat in store.categories" :key="cat.id"
                class="flex justify-between items-center p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <span class="font-medium text-slate-700">{{ cat.name }}</span>
                <div class="flex gap-1">
                    <el-button size="small" circle plain @click="handleEdit(cat)" title="Editar Nome">
                        <el-icon>
                            <Edit />
                        </el-icon>
                    </el-button>
                    <el-button size="small" type="danger" circle plain @click="handleDelete(cat)" title="Excluir">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </div>
            <div v-if="store.categories.length === 0" class="p-6 text-center text-slate-400 text-sm">
                Nenhuma categoria cadastrada.
            </div>
        </div>
        <template #footer>
            <el-button @click="$emit('close')" size="large">Fechar Janela</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useKbStore } from '../store/kb.store';
import { Collection, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import type { IKbCategory } from '../../domain/entities/kb';

defineProps<{ isOpen: boolean }>();
defineEmits(['close']);

const store = useKbStore();
const newCategory = ref('');

const handleAdd = async () => {
    if (!newCategory.value.trim()) return;
    await store.createCategory(newCategory.value.trim());
    newCategory.value = '';
};

const handleEdit = async (cat: IKbCategory) => {
    try {
        const { value } = await ElMessageBox.prompt('Introduza o novo nome para o assunto:', 'Editar Assunto', {
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            inputValue: cat.name,
            inputPattern: /.+/,
            inputErrorMessage: 'O nome não pode estar vazio.'
        });
        if (value && value !== cat.name) {
            await store.editCategory(cat.id, value);
        }
    } catch { }
};

const handleDelete = async (cat: IKbCategory) => {
    try {
        await ElMessageBox.confirm(
            `Tem a certeza que deseja apagar o assunto "${cat.name}"? Os artigos associados podem ficar sem categoria.`,
            'Excluir Assunto',
            {
                confirmButtonText: 'Sim, excluir',
                cancelButtonText: 'Cancelar',
                type: 'error'
            }
        );
        await store.removeCategory(cat.id);
    } catch { }
};
</script>