<template>
    <el-dialog :model-value="isOpen" @update:model-value="!$event && $emit('close')" width="95%"
        style="max-width: 850px;" destroy-on-close align-center class="rounded-xl overflow-hidden shadow-2xl">
        <template #header>
            <div class="flex justify-between items-center pb-4 border-b border-slate-100">
                <span
                    class="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                    {{ article?.category }}
                </span>
            </div>
        </template>
        <div v-if="article" class="py-2">
            <div class="flex items-center gap-5 mb-8">
                <div
                    class="w-16 h-16 bg-[#f8fafd] rounded-2xl flex items-center justify-center text-4xl text-blue-500 border border-slate-100 shadow-sm shrink-0">
                    <el-icon>
                        <component :is="article.icon" />
                    </el-icon>
                </div>
                <div>
                    <h1 class="text-2xl font-black text-slate-800 leading-tight mb-2">{{ article.title }}</h1>
                    <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold text-slate-400">
                        <span class="flex items-center gap-1.5 text-slate-600">
                            <img :src="article.authorAvatar" class="w-5 h-5 rounded-full object-cover" />
                            Por {{ article.authorName }}
                        </span>
                        <span class="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{{ article.date }}</span>
                        <span class="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>⏱ {{ article.readTimeMinutes }} min de leitura</span>
                    </div>
                </div>
            </div>
            <div class="bg-white p-4 sm:p-8 rounded-xl border border-slate-200 shadow-sm rich-text-content overflow-x-auto"
                v-html="article.content">
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end gap-3 pt-2">
                <el-button @click="$emit('close')" size="large" type="primary" plain>Fechar</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import type { IKbArticle } from '../../domain/entities/kb';

defineProps<{ isOpen: boolean; article: IKbArticle | null }>();
defineEmits(['close']);
</script>

<style scoped>
.rich-text-content {
    color: #334155;
    font-size: 0.95rem;
    line-height: 1.7;
}

:deep(.rich-text-content p) {
    margin-bottom: 1rem;
}

:deep(.rich-text-content h1),
:deep(.rich-text-content h2),
:deep(.rich-text-content h3) {
    color: #0f172a;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

:deep(.rich-text-content h2) {
    font-size: 1.25rem;
}

:deep(.rich-text-content strong) {
    font-weight: 700;
    color: #1e293b;
}

:deep(.rich-text-content ul),
:deep(.rich-text-content ol) {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
}

:deep(.rich-text-content ul) {
    list-style-type: disc;
}

:deep(.rich-text-content ol) {
    list-style-type: decimal;
}

:deep(.rich-text-content li) {
    margin-bottom: 0.25rem;
}

:deep(.rich-text-content blockquote) {
    border-left: 4px solid #cbd5e1;
    padding-left: 1rem;
    font-style: italic;
    color: #64748b;
    margin: 1.5rem 0;
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0 0.5rem 0.5rem 0;
}

:deep(.rich-text-content img) {
    max-width: 100%;
    height: auto;
}
</style>