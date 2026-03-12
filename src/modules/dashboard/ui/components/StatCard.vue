<template>
  <el-card shadow="hover" :class="['stats-card !border-l-4', borderColor]">
    <div class="flex items-center justify-between w-full">

      <el-statistic :value="value" :title="title" class="flex-1" />

      <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
        <el-icon :size="24" :class="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>

    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  title: string;
  value: string | number;
  icon: Component;
  borderColor: string;
  iconColor: string;
}>();
</script>

<style scoped>
.stats-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 16px;
  border: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.stats-card:hover {
  transform: translateY(-2px);
}

:deep(.el-statistic__content) {
  font-size: 26px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}

:deep(.el-statistic__head) {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 8px;
}
</style>