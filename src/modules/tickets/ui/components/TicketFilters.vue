<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
    <div class="flex items-center gap-4">
      <span class="text-slate-700 font-medium">Filtrar:</span>
      <button 
        v-for="option in options" 
        :key="option.value" 
        @click="$emit('update:modelValue', option.value)" 
        :class="['px-4 py-2 rounded-lg font-medium transition-all', modelValue === option.value ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200']"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits(['update:modelValue']);

const options = [
  { label: 'Todos', value: 'all' },
  { label: 'Abertos', value: 'open' },
  { label: 'Em Andamento', value: 'in-progress' },
  { label: 'Resolvidos', value: 'resolved' }
];
</script>