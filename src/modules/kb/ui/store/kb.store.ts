import { defineStore } from "pinia";
import type { IKbArticle } from "../../domain/entities/kb";
import { kbServices } from "../../data/kb.services";
import { ArticleCategory } from "../../domain/valueObjects/kb-enums";

export const useKbStore = defineStore('kb', {
  state: () => ({
    articles: [] as IKbArticle[],
    loading: false,
    searchQuery: '',
    selectedCategory: 'Todas' as ArticleCategory | 'Todas'
  }),

  getters: {
    filteredArticles: (state) => {
      let result = state.articles;

      if (state.selectedCategory !== 'Todas') {
        result = result.filter(a => a.category === state.selectedCategory);
      }
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        result = result.filter(a => 
          a.title.toLowerCase().includes(query) || 
          a.excerpt.toLowerCase().includes(query)
        );
      }

      return result;
    },
    
    availableCategories: (state) => {
      const categories = new Set(state.articles.map(a => a.category));
      return ['Todas', ...Array.from(categories)];
    }
  },

  actions: {
    async fetchArticles() {
      this.loading = true;
      try {
        this.articles = await kbServices.getArticles();
      } finally {
        this.loading = false;
      }
    },
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    setCategory(category: ArticleCategory | 'Todas') {
      this.selectedCategory = category;
    }
  }
});