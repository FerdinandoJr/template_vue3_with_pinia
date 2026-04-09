<template>
  <el-dialog :model-value="isOpen" @update:model-value="!$event && $emit('close')" :title="isEditing ? 'Editar Artigo' : 'Novo Artigo de Conhecimento'" width="95%" style="max-width: 900px;" destroy-on-close align-center :close-on-click-modal="false" class="rounded-xl overflow-hidden">
    <div class="bg-slate-50/50 p-6 rounded-lg border border-slate-100 mb-2">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" require-asterisk-position="right">
        
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-5 mb-2">
          <el-form-item label="Ícone" prop="icon" class="col-span-1 sm:col-span-3">
            <el-select v-model="form.icon" size="large" class="w-full text-center">
              <template #prefix>
                <el-icon class="text-blue-500 text-lg"> <component :is="form.icon" /> </el-icon>
              </template>
              <el-option v-for="ico in availableIcons" :key="ico" :label="ico" :value="ico">
                <div class="flex items-center gap-3 text-slate-600">
                  <el-icon class="text-lg"> <component :is="ico" /> </el-icon>
                  <span>{{ ico }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Título do Artigo" prop="title" class="col-span-1 sm:col-span-5">
            <el-input v-model="form.title" placeholder="Ex: Como realizar o estorno..." size="large" />
          </el-form-item>

          <el-form-item label="Categoria" prop="category" class="col-span-1 sm:col-span-4">
            <el-select v-model="form.category" placeholder="Selecione um assunto..." class="w-full" size="large">
              <template #prefix>
                <el-icon class="text-blue-500"> <Collection /> </el-icon>
              </template>
              <el-option v-for="cat in store.categories" :key="cat.id" :label="cat.name" :value="cat.name">
                <div class="flex items-center gap-2 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {{ cat.name }}
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-5 mb-4">
          <el-form-item label="Visibilidade" prop="visibility" class="col-span-1 sm:col-span-12">
            <el-radio-group v-model="form.visibility" size="large">
              <el-radio-button label="Publico">Público</el-radio-button>
              <el-radio-button label="Privado">Privado</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-form-item prop="content" class="mb-0">
          <template #label>
            <div class="flex justify-between items-center w-full">
              <span class="font-semibold text-slate-700">Conteúdo Completo</span>
              <span class="text-xs text-slate-400 font-normal flex items-center gap-1">
                <el-icon> <EditPen /> </el-icon>
              </span>
            </div>
          </template>
          
          <div class="w-full">
            <RichTextEditor 
                v-model="form.content" 
                placeholder="Escreva o conteúdo formatado aqui..." 
            />
          </div>
        </el-form-item>

      </el-form>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <span class="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <el-icon class="text-blue-500"> <InfoFilled /> </el-icon>
          Pode salvar como rascunho para terminar mais tarde.
        </span>
        <div class="flex gap-3 w-full sm:w-auto">
          <el-button @click="$emit('close')" size="large" class="w-full sm:w-auto">Cancelar</el-button>
          <el-button v-if="form.status !== 'Publicado'" type="warning" plain @click="submit('Rascunho')" size="large" class="!font-bold shadow-sm w-full sm:w-auto px-6">
            Rascunho
          </el-button>
          <el-button type="primary" @click="submit('Publicado')" size="large" class="!font-bold shadow-md w-full sm:w-auto px-6">
            <el-icon class="mr-2"> <Check /> </el-icon>
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
import { InfoFilled, Check, EditPen, Collection } from '@element-plus/icons-vue';
import RichTextEditor from '@/components/RichTextEditor.vue';

const props = defineProps<{ isOpen: boolean; article?: any }>();
const emit = defineEmits(['close', 'save']);

const formRef = ref<FormInstance>();
const store = useKbStore();
const authStore = useAuthStore();

const availableIcons = [
  'Document', 'ChatDotRound', 'Message', 'Phone', 'VideoCamera', 'Warning', 'Help', 'InfoFilled', 'List', 'Notebook', 'Collection', 'Switch', 'Setting', 'Ticket'
];

const isEditing = computed(() => !!props.article?.id);

const form = reactive({
  id: '',
  title: '',
  category: '',
  excerpt: '',
  content: '',
  icon: 'Document',
  status: 'Rascunho',
  visibility: 'Publico'
});

const rules = reactive<FormRules>({
  title: [{ required: true, message: 'O título é obrigatório', trigger: 'blur' }],
  category: [{ required: true, message: 'A categoria é obrigatória', trigger: 'change' }],
  icon: [{ required: true, message: 'Selecione um ícone', trigger: 'change' }],
  content: [
    { 
      required: false, 
      validator: (rule, value, callback) => {
        const isEmpty = !value || value === '<p></p>' || value.trim() === '';
        if (isEmpty && form.status === 'Publicado') {
          callback(new Error('O conteúdo não pode estar vazio para publicar'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
});

watch(() => props.isOpen, async (val) => {
  if (val) {
    if (props.article) {
      form.id = props.article.id || '';
      form.title = props.article.title || '';
      form.category = props.article.category || '';
      form.excerpt = props.article.excerpt || '';
      form.content = props.article.content || props.article.description || props.article.body || '';
      form.icon = props.article.icon || 'Document';
      form.status = props.article.status || 'Rascunho';
      form.visibility = props.article.visibility || 'Publico';
    } else {
      form.id = '';
      form.title = '';
      form.category = '';
      form.excerpt = '';
      form.content = '';
      form.icon = 'Document';
      form.status = 'Rascunho';
      form.visibility = 'Publico';
    }
  }
}, { immediate: true });

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
</style>