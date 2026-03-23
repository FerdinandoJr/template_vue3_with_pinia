<template>
  <div
    class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col h-full relative group">

    <div class="absolute top-4 right-4 z-10">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button circle
          class="!border-none !bg-transparent hover:!bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <el-icon class="text-lg">
            <MoreFilled />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit" :icon="Edit">Editar</el-dropdown-item>
            <el-dropdown-item command="delete" :icon="Delete"
              class="text-red-500 hover:!text-red-600 hover:!bg-red-50">Excluir</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="cursor-pointer flex-1 flex flex-col pt-1" @click="$emit('read', article)">
      <div class="flex justify-between items-start mb-4">

        <div
          class="w-12 h-12 bg-[#f8fafd] rounded-xl flex items-center justify-center text-2xl text-blue-500 group-hover:bg-blue-50 transition-colors">
          <el-icon>
            <component :is="article.icon" />
          </el-icon>
        </div>

        <div class="flex gap-2 mr-8">
          <span v-if="article.status === 'Rascunho'"
            class="bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
            Rascunho
          </span>

          <span
            class="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
            {{ article.category }}
          </span>

          <span v-if="article.visibility === 'Privado'"
            class="bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
            Privado
          </span>
        </div>
      </div>

      <h3
        class="text-[16px] font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors pr-6">
        {{ article.title }}
      </h3>

      <p class="text-[13px] font-medium text-slate-500 mb-6 flex-1 line-clamp-2">
        {{ article.excerpt }}
      </p>
    </div>

    <div class="flex justify-between items-center pt-4 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <img :src="article.authorAvatar" class="w-6 h-6 rounded-full object-cover shadow-sm" />
        <span class="text-[11px] font-bold text-slate-600">{{ article.authorName }}</span>
      </div>
      <div class="flex items-center gap-3 text-[11px] font-bold text-slate-400">
        <span title="Tempo de leitura" class="flex items-center gap-1">
          <el-icon>
            <Timer />
          </el-icon> {{ article.readTimeMinutes }}m
        </span>
        <span title="Visualizações" class="flex items-center gap-1">
          <el-icon>
            <View />
          </el-icon> {{ article.views }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MoreFilled, Edit, Delete, Timer, View } from '@element-plus/icons-vue';
import type { IKbArticle } from '../../domain/entities/kb';

const props = defineProps<{ article: IKbArticle }>();

const emit = defineEmits<{
  (e: 'read', article: IKbArticle): void;
  (e: 'edit', article: IKbArticle): void;
  (e: 'delete', article: IKbArticle): void;
}>();

const handleCommand = (command: string | number | object) => {
  if (command === 'read') emit('read', props.article);
  else if (command === 'edit') emit('edit', props.article);
  else if (command === 'delete') emit('delete', props.article);
};
</script>