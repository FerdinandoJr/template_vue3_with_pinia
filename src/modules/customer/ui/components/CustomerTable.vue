<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
    <div class="overflow-x-auto flex-1 custom-scrollbar">
      <table class="w-full text-left border-collapse whitespace-nowrap">

        <thead>
          <tr
            class="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[10px] uppercase tracking-widest font-black">
            <th class="px-6 py-4">Cliente / Empresa</th>
            <th class="px-6 py-4">Contato Responsável</th>
            <th class="px-6 py-4">Origem</th>
            <th class="px-6 py-4">Status</th>
            <th class="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>

        <tbody class="text-sm divide-y divide-slate-50">
          <tr v-for="client in clients" :key="client.uuid" @click="$emit('select', client.uuid)"
            class="hover:bg-slate-50 transition-colors group cursor-pointer">
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-100 shrink-0">
                  {{ client.avatar }}
                </div>
                <div>
                  <p class="font-bold text-slate-800">
                    <span v-if="client.tradeName">{{ client.tradeName }}</span>
                    <span v-else>{{ client.companyName }}</span>
                  </p>
                  <p class="text-[11px] text-slate-500 font-bold mt-0.5">
                    <span v-if="client.document">{{ client.document }}</span>
                    <span v-else>Sem CNPJ</span>
                  </p>
                </div>
              </div>
            </td>

            <td class="px-6 py-4">
              <p class="font-bold text-slate-700">{{ client.name }}</p>
              <p class="text-[11px] text-slate-500 font-medium mt-0.5">
                <span v-if="client.phone">{{ client.phone }}</span>
                <span v-else-if="client.email">{{ client.email }}</span>
                <span v-else>Sem contato principal</span>
              </p>
            </td>

            <td class="px-6 py-4">
              <span
                class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                <span v-if="client.source">{{ client.source }}</span>
                <span v-else>Sistema</span>
              </span>
            </td>

            <td class="px-6 py-4">
              <span
                :class="['px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500']">
                <span v-if="client.status === 'active'">Ativo</span>
                <span v-else>Inativo</span>
              </span>
            </td>

            <td class="px-6 py-4 text-right">
              <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click.stop="$emit('edit', client)"
                  class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Editar">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click.stop="$emit('delete', client.uuid)"
                  class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Excluir">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="clients.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-slate-500 font-medium">
              Nenhum cliente encontrado no sistema.
            </td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next';
import type { ICustomer } from '../../domain/entities/customer';

defineProps<{ clients: ICustomer[] }>();
defineEmits(['select', 'edit', 'delete']);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>