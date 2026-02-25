<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col h-full group">
    
    <div class="flex justify-between items-start mb-4">
      <div class="w-12 h-12 bg-[#f8fafd] rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-colors">
        {{ article.icon }}
      </div>
      <span class="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
        {{ article.category }}
      </span>
    </div>

    <h3 class="text-[16px] font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
      {{ article.title }}
    </h3>
    <p class="text-[13px] font-medium text-slate-500 mb-6 flex-1 line-clamp-2">
      {{ article.excerpt }}
    </p>

    <div class="flex justify-between items-center pt-4 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <img :src="article.authorAvatar" class="w-6 h-6 rounded-full object-cover" />
        <span class="text-[11px] font-bold text-slate-600">{{ article.authorName }}</span>
      </div>
      
      <div class="flex items-center gap-3 text-[11px] font-bold text-slate-400">
        <span title="Tempo de leitura">⏱ {{ article.readTimeMinutes }}m</span>
        <span title="Visualizações">👁 {{ article.views }}</span>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import type { IKbArticle } from '../../domain/entities/kb';

defineProps<{ article: IKbArticle }>();
</script>