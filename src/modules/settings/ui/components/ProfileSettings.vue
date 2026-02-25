<template>
  <div v-if="profile" class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-3xl">
    <h2 class="text-xl font-black text-slate-800 mb-6">Meu Perfil</h2>
    
    <div class="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
      <img :src="profile.avatar" class="w-24 h-24 rounded-full object-cover ring-4 ring-slate-50" />
      <div>
        <button class="bg-white border border-slate-200 text-slate-600 text-[12px] font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 mb-2">
          Alterar Foto
        </button>
        <p class="text-[11px] font-bold text-slate-400">JPG, GIF ou PNG. Máx de 2MB.</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Nome Completo</label>
        <input type="text" :value="profile.name" class="w-full bg-[#f8fafd] border border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 outline-none transition-colors" />
      </div>
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">E-mail</label>
        <input type="email" :value="profile.email" class="w-full bg-[#f8fafd] border border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 outline-none transition-colors" />
      </div>
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Telefone</label>
        <input type="text" :value="profile.phone" class="w-full bg-[#f8fafd] border border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 outline-none transition-colors" />
      </div>
      <div class="col-span-2 md:col-span-1">
        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Cargo</label>
        <input type="text" :value="profile.role" disabled class="w-full bg-slate-100 border border-transparent rounded-xl px-4 py-3 text-[13px] font-bold text-slate-400 outline-none cursor-not-allowed" />
      </div>
    </div>

    <div class="mt-8 flex justify-end">
      <button class="bg-[#1a56db] text-white px-6 py-3 rounded-xl text-[13px] font-bold shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors">
        Salvar Alterações
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IUserProfile } from '../../domain/entities/settings';
defineProps<{ profile: IUserProfile | null }>();
</script>