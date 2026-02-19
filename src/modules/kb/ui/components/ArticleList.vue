<template>
  <div class="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white h-full">
    <div class="max-w-5xl mx-auto">
        <h2 class="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight">{{ title }}</h2>

        <div class="space-y-6">
            <div 
                v-for="article in articles" 
                :key="article.id" 
                class="border border-slate-200 rounded-xl p-8 hover:border-blue-200 transition-all cursor-pointer bg-white group"
            >
                <h3 class="text-lg font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {{ article.title }}
                </h3>
                
                <p class="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                    {{ article.excerpt }}
                </p>
                
                <div class="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    <span class="text-slate-400">LEITURA: {{ article.readingTime }}</span>
                    <span class="text-slate-300">•</span>
                    <span class="text-blue-500 flex items-center gap-1 group-hover:underline">
                        LER COMPLETO 
                        <span class="text-xs">→</span>
                    </span>
                </div>
            </div>

            <div v-if="articles.length === 0" class="py-20 text-center">
                <p class="text-slate-400 font-medium">Nenhum artigo encontrado nesta categoria.</p>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Article } from '../../domain/entities/Article';

defineProps<{
  title: string;
  articles: Article[];
}>();
</script>