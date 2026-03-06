<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <el-card shadow="hover" class="stats-card !border-l-4 !border-l-slate-400">
      <el-statistic :value="total" title="Total de Tickets" />
    </el-card>

    <el-card shadow="hover" class="stats-card !border-l-4 !border-l-amber-500">
      <el-statistic :value="open" title="Abertos" />
    </el-card>

    <el-card shadow="hover" class="stats-card !border-l-4 !border-l-blue-500">
      <el-statistic :value="inProgress" title="Em Andamento" />
    </el-card>

    <el-card shadow="hover" class="stats-card !border-l-4 !border-l-green-500">
      <el-statistic :value="resolved" title="Resolvidos" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}>();
</script>

<style scoped>
.stats-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
}

:deep(.el-statistic__head) {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}
</style>