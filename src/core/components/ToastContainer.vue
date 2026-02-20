<template>
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="min-w-[300px] px-5 py-4 rounded-xl shadow-2xl text-sm font-bold text-white pointer-events-auto flex items-center justify-between"
        :class="{
          'bg-emerald-600': toast.type === 'success',
          'bg-red-600': toast.type === 'error',
          'bg-blue-600': toast.type === 'info'
        }"
      >
        <div class="flex items-center gap-3">
            <span v-if="toast.type === 'success'">✅</span>
            <span v-if="toast.type === 'error'">⚠️</span>
            <span v-if="toast.type === 'info'">ℹ️</span>
            <span>{{ toast.message }}</span>
        </div>
        <button @click="removeToast(toast.id)" class="ml-4 text-white/70 hover:text-white transition-colors">&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/core/composables/useToast';
const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>