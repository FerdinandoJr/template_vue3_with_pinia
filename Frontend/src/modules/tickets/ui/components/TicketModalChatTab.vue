<template>
  <div class="h-full flex flex-col w-full bg-[#efeae2] relative overflow-hidden">
    <div class="absolute inset-0 opacity-[0.06] pointer-events-none"
      style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-repeat: repeat;">
    </div>
    <div
      class="flex-1 overflow-y-auto p-4 custom-scroll space-y-3 relative z-10 flex flex-col max-w-4xl mx-auto w-full">
      <div class="flex justify-center mb-4 mt-2">
        <span class="bg-white/80 text-slate-500 text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm">Histórico do Atendimento</span>
      </div>
      <div v-for="(msg, index) in whatsappHistory" :key="index" class="flex"
        :class="msg.isAgent ? 'justify-end' : 'justify-start'">
        <div class="max-w-[85%] md:max-w-[65%] p-2 rounded-lg shadow-sm relative"
          :class="msg.isAgent ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'">
          <div v-if="!msg.isAgent"
            class="absolute -left-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-white border-r-white">
          </div>
          <div v-if="msg.isAgent"
            class="absolute -right-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-[#d9fdd3] border-l-[#d9fdd3]">
          </div>
          <div v-if="!msg.isAgent" class="text-[11px] font-black text-emerald-600 mb-0.5 px-1 tracking-tight">
            {{ msg.sender || customerName }}
          </div>
          <div class="text-[14px] text-[#111b21] leading-relaxed px-1 pb-3 whitespace-pre-wrap font-medium">
            {{ msg.text }}
          </div>
          <div class="text-[10px] text-slate-400 absolute bottom-1 right-2 flex items-center gap-1 font-bold">
            {{ msg.time }}
            <el-icon v-if="msg.isAgent" class="text-blue-500 text-[12px]"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue';

const props = defineProps<{
  whatsappHistory: any[];
  customerName: string;
}>();
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>
