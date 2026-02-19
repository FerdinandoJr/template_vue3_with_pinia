<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
      <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-800">Finalizar Atendimento</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">&times;</button>
      </div>

      <div class="p-6 space-y-4">
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
            <span class="font-bold">Cliente:</span> Tech Solutions Ltda (CNPJ: 57.156.369/0001-05) <br>
            <span class="font-bold">Tempo decorrido:</span> 15:00
        </div>

        <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo do Chamado</label>
            <select v-model="form.reason" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                <option value="Suporte Técnico">Suporte Técnico</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Dúvida Comercial">Dúvida Comercial</option>
                <option value="Outros">Outros</option>
            </select>
        </div>

        <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição do Atendimento</label>
            <textarea v-model="form.description" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none" placeholder="Descreva o que foi realizado..."></textarea>
        </div>
      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button @click="$emit('close')" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition">Cancelar</button>
        <button @click="save" class="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition">Concluir e Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'save']);

const form = reactive({
    reason: 'Suporte Técnico',
    description: ''
});

const save = () => {
    emit('save', {
        companyName: 'Nova Empresa Exemplo',
        cnpj: '00.000.000/0001-00',
        duration: '15m',
        reason: form.reason,
        description: form.description
    });
    form.description = '';
};
</script>