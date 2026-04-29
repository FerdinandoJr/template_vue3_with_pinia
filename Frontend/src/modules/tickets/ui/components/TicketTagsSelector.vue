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
                            <div class="flex items-center gap-2 cursor-pointer flex-1" @click="toggleTag(tag.name)">
                                <el-checkbox :model-value="isChecked(tag)" size="small" />
                                <el-tag size="small" :type="getTagType(tag) as any" effect="light" round
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
            <el-tag v-for="(tag, index) in normalizedSelectedTags" :key="index" :type="getTagType(tag) as any" closable
                @close="toggleTag(tag.originalValue)" size="default" effect="light" round
                class="font-semibold !border-none shadow-sm">{{ tag.name }}</el-tag>
            <span v-if="normalizedSelectedTags.length === 0"
                class="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">Sem
                marcadores</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Setting, Edit, Delete, Close } from '@element-plus/icons-vue';

const props = defineProps<{
    selectedTags: any[];
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:selectedTags', val: any[]): void;
}>();

const isOpen = ref(false);
const newTagInput = ref('');
const newTagType = ref('info');
const editingTagId = ref<number | null>(null);

const availableTags = ref([
    { id: 1, name: 'Bug', type: 'danger' },
    { id: 2, name: 'Crítico', type: 'danger' },
    { id: 3, name: 'Dúvida', type: 'warning' },
    { id: 4, name: 'Financeiro', type: 'success' },
    { id: 5, name: 'Urgente', type: 'warning' },
    { id: 6, name: 'Nova Funcionalidade', type: 'success' },
    { id: 7, name: 'Melhoria', type: 'primary' },
    { id: 8, name: 'Sugestão', type: 'info' }
]);

// MÁGICA: Normaliza qualquer coisa (String, Objeto, ID) para renderizar corretamente
const normalizedSelectedTags = computed(() => {
    if (!props.selectedTags) return [];
    return props.selectedTags.map(val => {
        if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
            const found = availableTags.value.find(t => t.id === Number(val));
            if (found) return { ...found, originalValue: val };
        }
        if (typeof val === 'string') {
            const found = availableTags.value.find(t => t.name.toLowerCase() === val.toLowerCase());
            if (found) return { ...found, originalValue: val };
            return { id: val, name: val, type: 'info', originalValue: val };
        }
        if (typeof val === 'object' && val !== null) {
            const name = val.label || val.name || String(val);
            let colorStr = val.color || val.colorClass?.split(' ')[0]?.replace('bg-', '').replace('-100', '') || 'info';
            if (name === 'Bug') colorStr = 'danger';
            else if (name === 'Crítico') colorStr = 'danger';
            else if (name === 'Urgente') colorStr = 'warning';
            else if (name === 'Nova Funcionalidade') colorStr = 'success';
            else if (name === 'Melhoria') colorStr = 'info';
            if (colorStr === 'pink' || colorStr === '') colorStr = 'info';
            return { id: val.id || name, name, type: colorStr, originalValue: val };
        }
        return { id: 'unknown', name: String(val), type: 'info', originalValue: val };
    });
});

const getTagType = (tag: any) => {
    const validTypes = ['primary', 'success', 'info', 'warning', 'danger'];
    if (!tag) return 'info';
    if (tag.type && validTypes.includes(tag.type)) return tag.type;
    const name = (tag.name || tag.label || '').toLowerCase();
    if (name.includes('bug') || name.includes('crítico') || name.includes('critico')) return 'danger';
    if (name.includes('urgente')) return 'warning';
    if (name.includes('nova funcionalidade') || name.includes('funcionalidade')) return 'success';
    if (name.includes('melhoria') || name.includes('melhoria')) return 'info';
    return 'info';
};

const isChecked = (tag: any) => {
    return props.selectedTags?.some(val => {
        if (val === tag.id) return true;
        if (typeof val === 'string' && val.toLowerCase() === tag.name.toLowerCase()) return true;
        return false;
    }) || false;
};

const toggleTag = (tagValue: any) => {
    if (props.readonly) return;

    let updated = [...(props.selectedTags || [])];

    const index = updated.findIndex(val => {
        if (val === tagValue) return true;
        if (typeof tagValue === 'string' && typeof val === 'string' && val.toLowerCase() === tagValue.toLowerCase()) return true;
        if (typeof tagValue === 'number' && Number(val) === tagValue) return true;
        return false;
    });

    if (index === -1) {
        updated.push(tagValue);
    } else {
        updated.splice(index, 1);
    }

    emit('update:selectedTags', updated);
};

const createTag = () => {
    if (!newTagInput.value.trim()) return;
    const newId = Math.max(...availableTags.value.map(t => t.id), 0) + 1;
    availableTags.value.push({
        id: newId,
        name: newTagInput.value.trim(),
        type: newTagType.value
    });
    newTagInput.value = '';
    newTagType.value = 'info';
};

const deleteTag = (id: number) => {
    const idx = availableTags.value.findIndex(t => t.id === id);
    if (idx !== -1) availableTags.value.splice(idx, 1);

    const updated = props.selectedTags.filter(val => val !== id);
    if (updated.length !== props.selectedTags?.length) {
        emit('update:selectedTags', updated);
    }
};

const startEdit = (tag: any) => {
    editingTagId.value = tag.id;
    newTagInput.value = tag.name;
    newTagType.value = tag.type;
};

const saveEdit = () => {
    if (!newTagInput.value.trim() || !editingTagId.value) return;
    const tag = availableTags.value.find(t => t.id === editingTagId.value);
    if (tag) {
        tag.name = newTagInput.value.trim();
        tag.type = newTagType.value;
    }
    cancelEdit();
};

const cancelEdit = () => {
    editingTagId.value = null;
    newTagInput.value = '';
    newTagType.value = 'info';
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