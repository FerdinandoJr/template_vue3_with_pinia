<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

    <div
      class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
      <div>
        <h3
          class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-600 transition-colors">
          Total de Tickets</h3>
        <p class="text-3xl font-black text-slate-800 leading-none">{{ total }}</p>
      </div>
      <div
        class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-slate-100 group-hover:text-slate-600 transition-all">
        <el-icon size="22">
          <Document />
        </el-icon>
      </div>
    </div>

    <div
      class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
      <div>
        <h3
          class="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">
          Abertos</h3>
        <p class="text-3xl font-black text-slate-800 leading-none">{{ open }}</p>
      </div>
      <div
        class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-all">
        <el-icon size="22">
          <WarnTriangleFilled />
        </el-icon>
      </div>
    </div>

    <div
      class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
      <div>
        <h3
          class="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">
          Aguardando</h3>
        <p class="text-3xl font-black text-slate-800 leading-none">{{ inProgress }}</p>
      </div>
      <div
        class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all">
        <el-icon size="22">
          <Timer />
        </el-icon>
      </div>
    </div>

    <div
      class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
      <div>
        <h3
          class="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">
          Resolvidos</h3>
        <p class="text-3xl font-black text-slate-800 leading-none">{{ resolved }}</p>
      </div>
      <div
        class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-all">
        <el-icon size="22">
          <CircleCheckFilled />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, WarnTriangleFilled, Timer, CircleCheckFilled } from '@element-plus/icons-vue';

defineProps<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}>();
</script>