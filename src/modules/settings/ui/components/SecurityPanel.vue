<template>
  <div class="max-w-2xl space-y-10 animate-fade-in">
    <header>
      <h2 class="text-2xl font-black text-slate-800 tracking-tight">Segurança</h2>
      <p class="text-slate-500 font-medium">Mantenha sua conta protegida com autenticação avançada.</p>
    </header>

    <div class="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
      <div class="space-y-1">
        <h4 class="font-bold text-slate-800">Autenticação de Dois Fatores</h4>
        <p class="text-xs text-slate-500">Adicione uma camada extra de proteção via app ou SMS.</p>
      </div>
      
      <button 
        @click="toggleAuth" 
        class="w-12 h-6 rounded-full transition-all relative shadow-inner" 
        :class="modelValue ? 'bg-blue-600' : 'bg-slate-300'"
      >
        <div 
          class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm" 
          :class="modelValue ? 'left-7' : 'left-1'"
        ></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'change']);

const toggleAuth = () => {
    emit('update:modelValue', !props.modelValue);
    emit('change');
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>