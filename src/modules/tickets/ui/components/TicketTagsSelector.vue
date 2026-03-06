<template>
    <div class="pb-2">
        <div class="flex justify-between items-center mb-3">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marcadores (Tags)</span>
            <el-popover v-if="!readonly" placement="left-start" :width="280" trigger="click" :visible="isOpen">
                <template #reference>
                    <el-button size="small" circle class="!bg-white shadow-sm border-slate-200"
                        @click="isOpen = !isOpen">
                        <el-icon class="text-slate-500">
                            <Setting />
                        </el-icon>
                    </el-button>
                </template>
                <div class="p-2">
                    <h4 class="text-xs font-bold text-slate-800 mb-3 pb-2 border-b">
                        <span v-if="editingTagId">Editar Marcador</span>
                        <span v-else>Gerenciar Marcadores</span>
                    </h4>

                    <div v-if="!editingTagId" class="space-y-1 mb-4 max-h-48 overflow-y-auto custom-scroll pr-1">
                        <div v-for="tag in availableTags" :key="tag.id"
                            class="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50 group border border-transparent hover:border-slate-100">
                            <div class="flex items-center gap-2 cursor-pointer flex-1" @click="toggleTag(tag.id)">
                                <el-checkbox :model-value="selectedTags.includes(tag.id)" size="small" />
                                <el-tag size="small" :type="tag.type as any" effect="light" round
                                    class="!border-0 font-bold">{{
                                    tag.name }}</el-tag>
                            </div>
                            <div class="opacity-0 group-hover:opacity-100 flex gap-1">
                                <el-button link size="small" type="primary" @click.stop="startEdit(tag)"><el-icon>
                                        <Edit />
                                    </el-icon></el-button>
                                <el-button link type="danger" size="small" @click.stop="deleteTag(tag.id)"><el-icon>
                                        <Delete />
                                    </el-icon></el-button>
                            </div>
                        </div>
                    </div>

                    <div class="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <el-input v-model="newTagInput" size="small"
                            :placeholder="editingTagId ? 'Editar nome...' : 'Nova tag...'" class="mb-2"
                            @keyup.enter="editingTagId ? saveEdit() : createTag()" />
                        <div class="flex items-center gap-2">
                            <el-select v-model="newTagType" size="small" style="width: 100px">
                                <el-option value="info" label="Cinza" />
                                <el-option value="success" label="Verde" />
                                <el-option value="warning" label="Laranja" />
                                <el-option value="danger" label="Vermelho" />
                            </el-select>

                            <template v-if="editingTagId">
                                <el-button type="success" size="small" class="flex-1"
                                    @click="saveEdit">Salvar</el-button>
                                <el-button type="info" size="small" plain class="!px-2" @click="cancelEdit"><el-icon>
                                        <Close />
                                    </el-icon></el-button>
                            </template>
                            <template v-else>
                                <el-button type="primary" size="small" class="flex-1"
                                    @click="createTag">Criar</el-button>
                            </template>
                        </div>
                    </div>
                    <el-button type="primary" plain class="w-full" size="small"
                        @click="isOpen = false">Concluir</el-button>
                </div>
            </el-popover>
        </div>
        <div class="flex flex-wrap gap-2">
            <el-tag v-for="tagId in selectedTags" :key="tagId" :type="getTagName(tagId).type as any" closable
                @close="toggleTag(tagId)" size="default" effect="light" round
                class="font-semibold !border-none shadow-sm">{{
                    getTagName(tagId).name }}</el-tag>
            <span v-if="selectedTags.length === 0"
                class="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">Sem
                marcadores</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting, Edit, Delete, Close } from '@element-plus/icons-vue';

const props = defineProps<{
    selectedTags: string[];
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:selectedTags', val: string[]): void
}>();

// Dados Locais (Na vida real viriam da API)
const availableTags = ref([
    { id: 't1', name: 'Financeiro', type: 'success' },
    { id: 't2', name: 'Urgente', type: 'danger' }
]);

const isOpen = ref(false);
const editingTagId = ref<string | null>(null);
const newTagInput = ref('');
const newTagType = ref('info');

const toggleTag = (id: string) => {
    if (props.readonly) return;
    const updated = [...props.selectedTags];
    const idx = updated.indexOf(id);
    if (idx === -1) updated.push(id);
    else updated.splice(idx, 1);
    emit('update:selectedTags', updated);
};

const createTag = () => {
    if (!newTagInput.value) return;
    availableTags.value.push({ id: `t${Date.now()}`, name: newTagInput.value, type: newTagType.value });
    newTagInput.value = '';
};

const startEdit = (tag: any) => {
    editingTagId.value = tag.id;
    newTagInput.value = tag.name;
    newTagType.value = tag.type;
};

const saveEdit = () => {
    const tag = availableTags.value.find(t => t.id === editingTagId.value);
    if (tag) {
        tag.name = newTagInput.value;
        tag.type = newTagType.value;
    }
    cancelEdit();
};

const cancelEdit = () => {
    editingTagId.value = null;
    newTagInput.value = '';
};

const deleteTag = (id: string) => {
    availableTags.value = availableTags.value.filter(t => t.id !== id);
    const updated = props.selectedTags.filter(tid => tid !== id);
    emit('update:selectedTags', updated);
};

const getTagName = (id: string) => availableTags.value.find(t => t.id === id) || { name: '?', type: 'info' };
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>