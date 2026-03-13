<template>
  <el-card shadow="hover" :class="['stats-card !border-l-4', borderColor]">
    <div class="flex items-center justify-between w-full">
      <el-statistic :value="value" class="flex-1">
        <template #title>
          <div class="flex items-center gap-1.5 mb-1.5">
            <span class="text-[11px] font-extrabold uppercase tracking-[0.05em] text-slate-500">{{ title }}</span>
            <el-tooltip v-if="tooltip" :content="tooltip" placement="top" effect="dark">
              <el-icon class="cursor-pointer text-slate-400 hover:text-blue-500 transition-colors outline-none">
                <InfoFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-statistic>

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
import { InfoFilled } from '@element-plus/icons-vue';

defineProps<{
  title: string;
  value: string | number;
  icon: Component;
  borderColor: string;
  iconColor: string;
  tooltip?: string;
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:deep(.el-statistic__content) {
  font-size: 26px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}
</style>