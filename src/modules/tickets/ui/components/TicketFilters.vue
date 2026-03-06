<template>
  <div class="mb-6">
    <el-radio-group :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="large">
      <el-radio-button v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { TicketStatus } from '../../domain/valueObjects/ticket-status.enum';

defineProps<{
  modelValue: TicketStatus | 'all';
}>();

defineEmits<{
  (e: 'update:modelValue', value: TicketStatus | 'all'): void;
}>();

const options: Array<{ label: string; value: TicketStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Abertos', value: TicketStatus.OPEN },
  { label: 'Em Andamento', value: TicketStatus.IN_PROGRESS },
  { label: 'Resolvidos', value: TicketStatus.RESOLVED },
];
</script>