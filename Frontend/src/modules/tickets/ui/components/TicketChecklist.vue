<template>
    <div class="mt-8 mb-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
        <h4 class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <el-icon class="text-blue-500">
                <List />
            </el-icon> Sub-tarefas / Checklist
        </h4>
        <div class="space-y-2.5">
            <div v-for="(item, index) in items" :key="index"
                class="flex items-center gap-3 group bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm transition-all hover:border-slate-300">
                <el-checkbox v-model="item.completed" :disabled="readonly" @change="emitUpdate" />
                <input v-model="item.title"
                    class="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 transition-all placeholder-slate-400"
                    :style="item.completed ? { textDecoration: 'line-through', color: '#94a3b8' } : {}"
                    placeholder="Descreva a tarefa..." :disabled="readonly" @input="emitUpdate" />
                <el-button v-if="!readonly" link type="danger" size="small"
                    class="opacity-0 group-hover:opacity-100 transition-opacity" @click="removeItem(index)">
                    <el-icon>
                        <Delete />
                    </el-icon>
                </el-button>
            </div>
            <el-button v-if="!readonly" plain type="primary" size="small" @click="addItem"
                class="mt-2 !border-dashed !border-blue-300 !text-blue-600 hover:!bg-blue-50 w-full">
                <el-icon class="mr-1">
                    <Plus />
                </el-icon> Nova Tarefa
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { List, Delete, Plus } from '@element-plus/icons-vue';

interface ChecklistItem { title: string; completed: boolean; }

const props = defineProps<{
    items: ChecklistItem[];
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:items', val: ChecklistItem[]): void
}>();

const emitUpdate = () => {
    emit('update:items', props.items);
};

const addItem = () => {
    const updated = [...props.items, { title: '', completed: false }];
    emit('update:items', updated);
};

const removeItem = (idx: number) => {
    const updated = [...props.items];
    updated.splice(idx, 1);
    emit('update:items', updated);
};
</script>