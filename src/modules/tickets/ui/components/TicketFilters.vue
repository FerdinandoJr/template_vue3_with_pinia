<template>
  <div class="flex gap-2 mb-6">
    <button 
      v-for="option in options" 
      :key="option.value"
      @click="$emit('update:modelValue', option.value)"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        modelValue === option.value 
          ? 'bg-slate-800 text-white' 
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      ]"
    >
      {{ option.label }}
    </button>
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