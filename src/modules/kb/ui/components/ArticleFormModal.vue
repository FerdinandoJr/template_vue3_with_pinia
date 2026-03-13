<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && $emit('close')"
        :title="isEditing ? 'Editar Artigo' : 'Novo Artigo de Conhecimento'" width="900px" destroy-on-close align-center
        class="rounded-xl overflow-hidden">
        <div class="bg-slate-50/50 p-6 rounded-lg border border-slate-100 mb-2">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" require-asterisk-position="right">

                <div class="grid grid-cols-12 gap-5 mb-2">
                    <el-form-item label="Ícone" prop="icon" class="col-span-12 sm:col-span-3">
                        <el-select v-model="form.icon" size="large" class="w-full text-center">
                            <template #prefix>
                                <el-icon class="text-blue-500 text-lg">
                                    <component :is="form.icon" />
                                </el-icon>
                            </template>
                            <el-option v-for="ico in availableIcons" :key="ico" :label="ico" :value="ico">
                                <div class="flex items-center gap-3 text-slate-600">
                                    <el-icon class="text-lg">
                                        <component :is="ico" />
                                    </el-icon>
                                    <span>{{ ico }}</span>
                                </div>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="Título do Artigo" prop="title" class="col-span-12 sm:col-span-5">
                        <el-input v-model="form.title" placeholder="Ex: Como realizar o estorno..." size="large" />
                    </el-form-item>

                    <el-form-item label="Categoria" prop="category" class="col-span-12 sm:col-span-4">
                        <el-select v-model="form.category" size="large" class="w-full"
                            placeholder="Selecione o assunto">
                            <el-option v-for="cat in store.categories" :key="cat.id" :label="cat.name"
                                :value="cat.name">
                                <div class="flex items-center gap-2 font-medium">
                                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {{ cat.name }}
                                </div>
                            </el-option>
                        </el-select>
                    </el-form-item>
                </div>

                <el-form-item label="Resumo do Artigo (Visível no Card)" prop="excerpt" class="mb-5">
                    <el-input v-model="form.excerpt" type="textarea" :rows="2" maxlength="120" show-word-limit
                        placeholder="Escreva uma breve descrição para ajudar a equipa a identificar o conteúdo..." />
                </el-form-item>

                <el-form-item prop="content" class="mb-0">
                    <template #label>
                        <div class="flex justify-between items-center w-full">
                            <span class="font-semibold text-slate-700">Conteúdo Completo</span>
                            <span class="text-xs text-slate-400 font-normal flex items-center gap-1">
                                <el-icon>
                                    <EditPen />
                                </el-icon>
                            </span>
                        </div>
                    </template>

                    <div class="w-full">
                        <QuillEditor v-model:content="form.content" contentType="html" :toolbar="[
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'align': [] }],
                            [{ 'color': [] }, { 'background': [] }],
                            ['link', 'image', 'video'],
                            ['clean']
                        ]" theme="snow"
                            placeholder="Escreva o conteúdo formatado aqui. Pode colar imagens (Ctrl+V) diretamente no texto..." />
                    </div>
                </el-form-item>
            </el-form>
        </div>

        <template #footer>
            <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <span class="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <el-icon class="text-blue-500">
                        <InfoFilled />
                    </el-icon>
                    Pode salvar como rascunho para terminar mais tarde.
                </span>
                <div class="flex gap-3 w-full sm:w-auto">
                    <el-button @click="$emit('close')" size="large" class="w-full sm:w-auto">Cancelar</el-button>

                    <el-button v-if="form.status !== 'Publicado'" type="warning" plain @click="submit('Rascunho')"
                        size="large" class="!font-bold shadow-sm w-full sm:w-auto px-6">
                        Rascunho
                    </el-button>

                    <el-button type="primary" @click="submit('Publicado')" size="large"
                        class="!font-bold shadow-md w-full sm:w-auto px-6">
                        <el-icon class="mr-2">
                            <Check />
                        </el-icon>
                        {{ isEditing && form.status === 'Publicado' ? 'Salvar' : 'Publicar' }}
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useKbStore } from '../store/kb.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { InfoFilled, Check, EditPen } from '@element-plus/icons-vue';

import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps<{ isOpen: boolean; article?: any }>();
const emit = defineEmits(['close', 'save']);

const formRef = ref<FormInstance>();
const store = useKbStore();
const authStore = useAuthStore();

const availableIcons = [
    'Document', 'ChatDotRound', 'Message', 'Phone', 'VideoCamera',
    'Warning', 'Help', 'InfoFilled', 'List', 'Notebook', 'Collection', 'Switch', 'Setting', 'Ticket'
];

const isEditing = computed(() => !!props.article?.id);

const form = reactive({
    id: '',
    title: '',
    category: '',
    excerpt: '',
    content: '',
    icon: 'Document',
    status: 'Rascunho'
});

const rules = reactive<FormRules>({
    title: [{ required: true, message: 'O título é obrigatório', trigger: 'blur' }],
    category: [{ required: true, message: 'A categoria é obrigatória', trigger: 'change' }],
    icon: [{ required: true, message: 'Selecione um ícone', trigger: 'change' }],
    content: [
        {
            required: false,
            validator: (rule, value, callback) => {
                const isEmpty = !value || value === '<p><br></p>' || value.trim() === '';
                if (isEmpty && form.status === 'Publicado') callback(new Error('O conteúdo não pode estar vazio para publicar'));
                else callback();
            },
            trigger: 'blur'
        }
    ]
});

watch(() => props.isOpen, (val) => {
    if (val) {
        if (props.article) {
            Object.assign(form, props.article);
        } else {
            form.id = '';
            form.title = '';
            form.category = '';
            form.excerpt = '';
            form.content = '';
            form.icon = 'Document';
            form.status = 'Rascunho';
        }
    }
});

const submit = async (targetStatus: 'Rascunho' | 'Publicado') => {
    if (!formRef.value) return;

    form.status = targetStatus;

    await formRef.value.validate((valid) => {
        if (valid) {
            const payload: any = { ...form };

            if (!payload.excerpt && payload.content) {
                const plainText = payload.content.replace(/<[^>]*>?/gm, '');
                payload.excerpt = plainText.substring(0, 100) + '...';
            }

            if (!isEditing.value) {
                payload.authorName = authStore.user?.name || 'Agente';
                payload.authorAvatar = `https://ui-avatars.com/api/?name=${payload.authorName}&background=random`;
                payload.readTimeMinutes = Math.max(1, Math.ceil(payload.content.split(' ').length / 200));
            }

            emit('save', payload);
        }
    });
};
</script>

<style scoped>
:deep(.el-dialog__header) {
    border-bottom: 1px solid #f1f5f9;
    margin-right: 0;
    padding-bottom: 20px;
}

:deep(.el-form-item__label) {
    font-weight: 600;
    color: #334155;
    padding-bottom: 4px;
}

:deep(.ql-toolbar.ql-snow) {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    border-color: #e2e8f0;
    background-color: #f8fafc;
    font-family: inherit;
    padding: 12px;
}

:deep(.ql-container.ql-snow) {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    border-color: #e2e8f0;
    min-height: 300px;
    background-color: #ffffff;
    font-family: inherit;
    font-size: 0.875rem;
}

:deep(.ql-editor) {
    min-height: 300px;
    color: #334155;
    line-height: 1.6;
}

:deep(.ql-editor.ql-blank::before) {
    color: #94a3b8;
    font-style: normal;
}

:deep(.ql-editor img) {
    max-width: 100%;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    margin: 1rem 0;
}
</style>