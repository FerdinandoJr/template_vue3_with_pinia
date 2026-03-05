<template>
  <el-card shadow="hover" class="border-none shadow-sm !rounded-[24px] h-full"
    :body-style="{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '24px' }">
    <div
      :class="[color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shrink-0']">
      <el-icon :size="24">
        <component :is="icon" />
      </el-icon>
    </div>
    <div>
      <p class="text-sm font-bold text-slate-400 uppercase tracking-wider">{{ title }}</p>
      <p class="text-2xl font-black text-slate-800">{{ value }}</p>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  title: string;
  value: string | number;
  icon: Component;
  color: string
}>();
</script>