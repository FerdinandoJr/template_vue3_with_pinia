<template>
  <div class="max-w-2xl space-y-10 animate-fade-in">
    <header>
      <h2 class="text-2xl font-black text-slate-800 tracking-tight">Meu Perfil</h2>
      <p class="text-slate-500 font-medium">Gerencie suas informações pessoais e foto de exibição.</p>
    </header>

    <div class="flex items-center gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
      <img :src="profile.avatar" class="w-24 h-24 rounded-2xl shadow-lg border-4 border-white object-cover">
      <div class="space-y-2">
        <button class="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
          Alterar Foto
        </button>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">JPG, GIF ou PNG. Max 2MB.</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-400 uppercase px-1">Nome Completo</label>
        <input 
          v-model="profile.name" 
          type="text" 
          class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
        >
      </div>
      <div class="space-y-2">
        <label class="text-[10px] font-black text-slate-400 uppercase px-1">E-mail</label>
        <input 
          v-model="profile.email" 
          type="email" 
          class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
        >
      </div>
    </div>

    <div class="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-4">
      <button class="px-8 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">
        Descartar
      </button>
      <button 
        @click="$emit('save')"
        class="px-10 py-3 rounded-2xl text-sm font-bold bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition transform active:scale-95"
      >
        Salvar Alterações
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '../../domain/entities/UserSettings';
const props = defineProps<{ profile: UserProfile }>();
const emit = defineEmits(['save']);
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>