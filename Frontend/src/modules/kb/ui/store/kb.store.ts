import { defineStore } from "pinia";
import type { IKbArticle, IKbCategory } from "../../domain/entities/kb";
import { kbServices } from "../../data/kb.services";
import { ElMessage } from "element-plus";

export const useKbStore = defineStore('kb', {
  state: () => ({
    articles: [] as IKbArticle[],
    categories: [] as IKbCategory[],
    loading: false,
    total: 0,
    currentPage: 1,
    limit: 12,
    searchQuery: '',
    selectedCategory: 'Todas' as string
  }),
  getters: {
    availableCategoryNames: (state) => ['Todas', ...state.categories.map(c => c.name)]
  },
  actions: {
    async fetchArticles() {
      this.loading = true;
      try {
        const response = await kbServices.getArticles({
          page: this.currentPage,
          limit: this.limit,
          search: this.searchQuery,
          category: this.selectedCategory
        });
        this.articles = response || [];
        this.total = (response || []).length;
      } catch (error) {
        ElMessage.error('Erro ao carregar os artigos.');
        this.articles = [];
        this.total = 0;
      } finally {
        this.loading = false;
      }
    },

    setSearchQuery(query: string) {
      this.searchQuery = query;
      this.currentPage = 1;
      this.fetchArticles();
    },

    setCategory(category: string) {
      this.selectedCategory = category;
      this.currentPage = 1;
      this.fetchArticles();
    },

    setPage(page: number) {
      this.currentPage = page;
      this.fetchArticles();
    },

    async saveArticle(data: any, id?: string) {
      this.loading = true;
      try {
        if (id) {
          await kbServices.updateArticle(id, data);
          ElMessage.success('Artigo atualizado com sucesso!');
        } else {
          await kbServices.createArticle(data);
          ElMessage.success('Artigo guardado com sucesso!');
          this.currentPage = 1;
        }
        await this.fetchArticles();
      } catch (error) {
        ElMessage.error('Erro ao guardar o artigo.');
      } finally {
        this.loading = false;
      }
    },

    async removeArticle(id: string) {
      this.loading = true;
      try {
        await kbServices.deleteArticle(id);
        ElMessage.success('Artigo apagado com sucesso!');
        if (this.articles.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        await this.fetchArticles();
      } catch (error) {
        ElMessage.error('Erro ao apagar artigo.');
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      try {
        this.categories = await kbServices.getCategories();
      } catch (error) {
        ElMessage.error('Erro ao carregar categorias.');
      }
    },

    async createCategory(name: string) {
      try {
        await kbServices.createCategory(name);
        await this.fetchCategories();
        ElMessage.success('Assunto adicionado!');
      } catch (error) {
        ElMessage.error('Erro ao criar assunto.');
      }
    },

    async editCategory(id: string, name: string) {
      try {
        await kbServices.updateCategory(id, name);
        await this.fetchCategories();
        ElMessage.success('Assunto atualizado!');
      } catch (error) {
        ElMessage.error('Erro ao editar assunto.');
      }
    },

    async removeCategory(id: string) {
      try {
        await kbServices.deleteCategory(id);
        await this.fetchCategories();
        ElMessage.success('Assunto apagado!');
      } catch (error) {
        ElMessage.error('Erro ao apagar assunto.');
      }
    }
  }
});