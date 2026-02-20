import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { Article } from "../../domain/entities/Article";
import { KbDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useKbStore = defineStore('kb', () => {
    const getArticlesUseCase = inject(KbDI.GetArticles)!;
    const getCategoriesUseCase = inject(KbDI.GetCategories)!;    
    const { showToast } = useToast();
    const categories = ref<string[]>([]);
    const articles = ref<Article[]>([]);
    const activeCategory = ref('FAQ');
    const searchQuery = ref('');
    const loading = ref(false);

    const filteredArticles = computed(() => {
        let result = articles.value;

        if (activeCategory.value) {
            result = result.filter(a => a.category === activeCategory.value);
        }
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            result = result.filter(a => 
                a.title.toLowerCase().includes(query) || 
                a.excerpt.toLowerCase().includes(query)
            );
        }

        return result;
    });

    const loadData = async () => {
        loading.value = true;
        try {
            const [cats, arts] = await Promise.all([
                getCategoriesUseCase.execute(),
                getArticlesUseCase.execute()
            ]);
            categories.value = cats;
            articles.value = arts;
            
            if (!activeCategory.value && cats.length > 0) {
                activeCategory.value = cats[0] as string;
            }
        } catch (error) {
            console.error("[KbStore] Erro ao carregar Base de Conhecimento:", error);
            showToast("Falha ao carregar artigos. Verifique sua conexão.", "error");
        } finally {
            loading.value = false;
        }
    };

    const setCategory = (category: string) => {
        activeCategory.value = category;
        searchQuery.value = ''; 
    };

    return { 
        categories, 
        articles, 
        activeCategory, 
        searchQuery, 
        filteredArticles, 
        loading, 
        loadData, 
        setCategory 
    };
});