<template>
  <el-radio-group :model-value="current" @update:model-value="$emit('update:period', $event)" size="large">
    <el-radio-button v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </el-radio-button>
  </el-radio-group>
</template>

<script setup lang="ts">
import { DashboardPeriod } from '../../domain/valueObjects/dashboard-period.enum';

defineProps<{ current: DashboardPeriod }>();
defineEmits<{ (e: 'update:period', value: DashboardPeriod): void }>();

const options = [
  { label: 'Hoje', value: DashboardPeriod.TODAY },
  { label: '7 Dias', value: DashboardPeriod.LAST_7_DAYS },
  { label: '30 Dias', value: DashboardPeriod.LAST_30_DAYS },
  { label: 'Mensal', value: DashboardPeriod.MONTHLY },
];
</script>