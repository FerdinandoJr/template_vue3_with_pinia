<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
 
    <template v-if="isMounted">

      <div
        class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</p>
          <h3 class="text-2xl font-black text-slate-800">{{ total }}</h3>
        </div>
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <el-icon :size="20">
            <Document />
          </el-icon>
        </div>
      </div>

      <div
        class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
          <p class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Abertos</p>
          <h3 class="text-2xl font-black text-blue-600">{{ open }}</h3>
        </div>
        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <el-icon :size="20">
            <FolderOpened />
          </el-icon>
        </div>
      </div>

      <div
        class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
          <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Em Andamento</p>
          <h3 class="text-2xl font-black text-amber-500">{{ inProgress }}</h3>
        </div>
        <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
          <el-icon :size="20">
            <Loading />
          </el-icon>
        </div>
      </div>

      <div
        class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
          <p class="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Resolvidos</p>
          <h3 class="text-2xl font-black text-emerald-500">{{ resolved }}</h3>
        </div>
        <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
          <el-icon :size="20">
            <CircleCheck />
          </el-icon>
        </div>
      </div>

    </template>

    <template v-else>
      <div v-for="i in 4" :key="i" class="bg-slate-100 p-4 rounded-2xl border border-slate-200 h-[80px] animate-pulse">
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Document, FolderOpened, Loading, CircleCheck } from '@element-plus/icons-vue';

const props = defineProps<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}>();

const isMounted = ref(false);

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true;
  }, 100);
});

onBeforeUnmount(() => {
  isMounted.value = false;
});
</script>