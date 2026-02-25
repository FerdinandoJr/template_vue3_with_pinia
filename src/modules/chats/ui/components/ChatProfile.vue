<template>
  <div class="w-[320px] bg-white p-8 flex flex-col items-center h-full overflow-y-auto shrink-0">
    <div class="mb-4">
      <img :src="contact.avatar" class="w-[100px] h-[100px] rounded-full object-cover ring-[6px] ring-slate-50" />
    </div>
    <h3 class="font-black text-slate-800 text-[18px] mb-1">{{ contact.name }}</h3>
    <p class="text-[13px] font-semibold text-slate-400 mb-8">{{ contact.company }}</p>

    <div class="flex gap-3 w-full mb-10">
      <button class="flex-1 py-2.5 bg-white border border-slate-200 rounded-[10px] text-[11px] font-black text-slate-500 uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm">Perfil</button>
      <button class="flex-1 py-2.5 bg-[#f8fafd] border border-transparent rounded-[10px] text-[11px] font-black text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors">Tickets</button>
    </div>

    <div class="w-full space-y-6">
      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Contato</label>
        <div class="space-y-3">
          <div class="bg-[#f8fafd] border border-slate-100 p-3.5 rounded-[12px] flex items-center gap-3">
            <span class="text-slate-300 text-sm">✉️</span>
            <span class="text-[12px] font-bold text-slate-600 truncate">{{ contact.email }}</span>
          </div>
          <div class="bg-[#f8fafd] border border-slate-100 p-3.5 rounded-[12px] flex items-center gap-3">
            <span class="text-slate-300 text-sm">📞</span>
            <span class="text-[12px] font-bold text-slate-600">{{ contact.phone }}</span>
          </div>
        </div>
      </div>

      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Tags</label>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="t in contact.tags" :key="t" 
            class="px-3 py-1.5 bg-[#f8fafd] border border-slate-100 text-slate-500 rounded-[8px] text-[10px] font-black uppercase"
          >
            {{ t }}
          </span>
          <button class="w-8 h-8 border-[1.5px] border-dashed border-slate-200 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-slate-50">
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ contact: any }>();
</script>