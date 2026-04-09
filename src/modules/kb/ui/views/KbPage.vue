<template>
  <div class="p-6 h-full flex flex-col bg-slate-50">

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
      <div>
        <h2 class="text-2xl font-black text-slate-800 tracking-tight">FAQ</h2>
        <p class="text-slate-500 text-sm font-medium mt-1">Consulte documentações, roteiros e políticas</p>
      </div>

      <div class="flex items-center gap-3">
        <el-button plain size="large" class="!rounded-lg" @click="isCategoryModalOpen = true" title="Gerir Assuntos">
          <el-icon>
            <Setting />
          </el-icon>
        </el-button>

        <el-button type="primary" size="large" class="!font-bold !rounded-lg shadow-sm px-5" @click="openFormModal()">
          <el-icon class="mr-2">
            <Plus />
          </el-icon> Novo Artigo
        </el-button>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-8 shrink-0">

      <div class="flex-1 w-full relative">
        <el-input v-model="localSearch" @input="handleSearch"
          placeholder="Pesquisar por palavras-chave, títulos ou conteúdos..." class="premium-input w-full" clearable>
          <template #prefix>
            <el-icon class="text-slate-400 text-lg ml-1">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="w-full sm:w-[280px] shrink-0">
        <el-select :model-value="selectedCategory" @update:model-value="store.setCategory"
          placeholder="Filtrar por assunto" class="premium-select w-full" filterable>
          <template #prefix>
            <el-icon class="text-slate-400 text-lg ml-1">
              <Filter />
            </el-icon>
          </template>
          <el-option v-for="catName in store.availableCategoryNames" :key="catName"
            :label="catName === 'Todas' ? 'Todos os Assuntos' : catName" :value="catName">
            <div class="flex items-center justify-between w-full">
              <span :class="selectedCategory === catName ? 'font-bold text-blue-600' : 'font-medium text-slate-600'">
                {{ catName === 'Todas' ? 'Todos os Assuntos' : catName }}
              </span>
              <span v-if="selectedCategory === catName" class="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <div class="flex-1 flex flex-col min-h-0">
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">

        <div v-if="store.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-4">
          <div v-for="i in 8" :key="i"
            class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[220px] flex flex-col">
            <el-skeleton animated class="h-full flex flex-col">
              <template #template>
                <div class="flex justify-between items-start mb-4">
                  <el-skeleton-item variant="image" style="width: 48px; height: 48px; border-radius: 12px;" />
                  <el-skeleton-item variant="text" style="width: 60px; height: 24px; border-radius: 8px;" />
                </div>
                <el-skeleton-item variant="h3" style="width: 80%; margin-bottom: 8px; height: 20px;" />
                <el-skeleton-item variant="text" style="width: 100%; margin-bottom: 4px;" />
                <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 24px;" />
                <div class="mt-auto flex justify-between items-center pt-4 border-t border-slate-100">
                  <el-skeleton-item variant="text" style="width: 80px;" />
                  <el-skeleton-item variant="text" style="width: 60px;" />
                </div>
              </template>
            </el-skeleton>
          </div>
        </div>

        <div v-else-if="store.articles.length === 0"
          class="flex flex-col items-center justify-center h-full text-slate-400">
          <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <el-icon :size="32" class="text-slate-400">
              <DocumentDelete />
            </el-icon>
          </div>
          <h3 class="text-lg font-bold text-slate-600 mb-1">Nenhum artigo encontrado</h3>
          <p class="text-sm">Tente ajustar a sua busca ou limpar os filtros.</p>
          <el-button v-if="localSearch || selectedCategory !== 'Todas'" @click="clearFilters" plain
            class="mt-4 !rounded-lg">
            Limpar Filtros
          </el-button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-4">
          <ArticleCard v-for="article in store.articles" :key="article.id" :article="article" @read="openViewModal"
            @edit="openFormModal" @delete="promptDelete" />
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center shrink-0">
        <span class="text-sm font-medium text-slate-500">
          A mostrar <strong class="text-slate-800">{{ store.articles.length }}</strong> de <strong
            class="text-slate-800">{{
              store.total }}</strong> registos
        </span>

        <el-pagination v-if="store.total > store.limit" :current-page="store.currentPage" :page-size="store.limit"
          :total="store.total" @current-change="store.setPage" layout="prev, pager, next" background
          class="custom-pagination" />
      </div>
    </div>

    <ArticleFormModal :is-open="isFormModalOpen" :article="articleToEdit" @close="isFormModalOpen = false"
      @save="handleSave" />

    <ArticleViewModal :is-open="isViewModalOpen" :article="articleToView" @close="isViewModalOpen = false" />

    <CategoryManagerModal :is-open="isCategoryModalOpen" @close="isCategoryModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useKbStore } from '../store/kb.store';
import { Plus, Search, Filter, DocumentDelete, Setting } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

import ArticleCard from '../components/ArticleCard.vue';
import ArticleFormModal from '../components/ArticleFormModal.vue';
import ArticleViewModal from '../components/ArticleViewModal.vue';
import CategoryManagerModal from '../components/CategoryManagerModal.vue';

const store = useKbStore();
const { selectedCategory } = storeToRefs(store);

const localSearch = ref('');
let searchTimeout: any;

const isFormModalOpen = ref(false);
const articleToEdit = ref<any>(null);

const isViewModalOpen = ref(false);
const articleToView = ref<any>(null);

const isCategoryModalOpen = ref(false);

const handleSearch = (val: string) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.setSearchQuery(val);
  }, 300);
};

const clearFilters = () => {
  localSearch.value = '';
  store.setSearchQuery('');
  store.setCategory('Todas');
};

const openFormModal = (article?: any) => {
  articleToEdit.value = article ? { ...article } : null;
  isFormModalOpen.value = true;
};

const openViewModal = (article: any) => {
  articleToView.value = article;
  isViewModalOpen.value = true;
};

const handleSave = async (data: any) => {
  await store.saveArticle(data, data.id);
  isFormModalOpen.value = false;
};

const promptDelete = async (article: any) => {
  try {
    await ElMessageBox.confirm(
      `Tem a certeza que deseja excluir o artigo "${article.title}"?`,
      'Excluir Artigo',
      { confirmButtonText: 'Excluir', cancelButtonText: 'Cancelar', type: 'error' }
    );
    await store.removeArticle(article.id);
  } catch {
    // Ação cancelada pelo utilizador
  }
};

onMounted(() => {
  store.fetchCategories();
  store.fetchArticles();
});
</script>

<style scoped>
:deep(.premium-input),
:deep(.premium-select) {
  height: 52px;
}

:deep(.premium-input .el-input__wrapper),
:deep(.premium-select .el-select__wrapper) {
  min-height: 52px;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px #e2e8f0 inset !important;
  transition: all 0.2s ease-in-out;
  padding: 0 16px;
}

:deep(.premium-input .el-input__wrapper:hover),
:deep(.premium-select .el-select__wrapper:hover) {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 0 0 1px #cbd5e1 inset !important;
}

:deep(.premium-input .el-input__wrapper.is-focus),
:deep(.premium-select .el-select__wrapper.is-focused) {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 0 0 2px #3b82f6 inset !important;
  background-color: #ffffff;
}

:deep(.premium-input .el-input__inner),
:deep(.premium-select .el-select__placeholder) {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
}

:deep(.premium-input .el-input__inner::placeholder) {
  color: #94a3b8;
  font-weight: 400;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

:deep(.custom-pagination .el-pager li) {
  background-color: transparent !important;
  border-radius: 0.5rem;
  font-weight: 600;
  color: #64748b;
}

:deep(.custom-pagination .el-pager li:hover) {
  color: #3b82f6;
  background-color: #f1f5f9 !important;
}

:deep(.custom-pagination .el-pager li.is-active) {
  background-color: #1e293b !important;
  color: #ffffff;
}

:deep(.custom-pagination .btn-prev),
:deep(.custom-pagination .btn-next) {
  background-color: transparent !important;
  border-radius: 0.5rem;
  color: #64748b;
}

:deep(.custom-pagination .btn-prev:hover),
:deep(.custom-pagination .btn-next:hover) {
  color: #3b82f6;
  background-color: #f1f5f9 !important;
}
</style>