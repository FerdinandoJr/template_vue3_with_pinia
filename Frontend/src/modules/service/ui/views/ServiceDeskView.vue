<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all border border-slate-200">
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-800">Finalizar Atendimento</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
      </div>

      <div class="p-6 space-y-5">
        <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-black uppercase text-[10px] tracking-wider">Cliente:</span>
            <span class="font-medium">Tech Solutions Ltda</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-black uppercase text-[10px] tracking-wider">Protocolo:</span>
            <span class="font-mono">#{{ Math.floor(Math.random() * 1000) }}</span>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Motivo do Chamado</label>
          <select v-model="form.reason" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all appearance-none">
            <option value="Suporte Técnico">🛠️ Suporte Técnico</option>
            <option value="Financeiro">💰 Financeiro</option>
            <option value="Dúvida Comercial">🤝 Dúvida Comercial</option>
            <option value="Outros">📁 Outros</option>
          </select>
        </div>

        <div>
          <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Descrição do Atendimento</label>
          <textarea v-model="form.description" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-400 transition-all resize-none" placeholder="O que foi resolvido?"></textarea>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button @click="$emit('close')" class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
        <button @click="handleSave" class="px-8 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-lg shadow-slate-200 transition-transform active:scale-95">Salvar e Concluir</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import type { FinishServicePayload } from '../store/service.store';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: FinishServicePayload): void;
}>();

const form = reactive({
  reason: 'Suporte Técnico',
  description: ''
});

const handleSave = () => {
  emit('save', {
    companyName: 'Tech Solutions Ltda',
    cnpj: '57.156.369/0001-05',
    duration: '15m',
    reason: form.reason,
    description: form.description
  });
  form.description = '';
};
</script>