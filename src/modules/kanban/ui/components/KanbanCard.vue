<template>
  <div
    class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab hover:shadow-md hover:border-blue-300 active:cursor-grabbing transition-all relative group">
    <div class="flex justify-between items-start mb-2">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{{ ticket?.id || 'NOVO' }}</span>
      <el-tag size="small" :type="getPriorityType(ticket?.priority as string)" effect="plain"
        class="font-semibold border-none">
        {{ getPriorityLabel(ticket?.priority as string) }}
      </el-tag>
    </div>

    <h4 class="font-bold text-slate-800 text-sm mb-3 leading-tight line-clamp-2">
      {{ ticket?.title || 'Sem Título' }}
    </h4>

    <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <el-avatar :size="24" class="bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
          {{ customerData?.avatar || ticket?.customer?.charAt(0).toUpperCase() || 'C' }}
        </el-avatar>
        <span class="text-xs font-medium text-slate-600 truncate max-w-[160px]" :title="customerNameDisplay">
          {{ customerNameDisplay }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';

const props = defineProps<{ ticket: ITicket }>();
const customerStore = useCustomerStore();

// Proteção contra leitura de itens indefinidos
const customerData = computed(() => {
  if (!props.ticket || !props.ticket.customer) return null;
  if (!customerStore.items || !Array.isArray(customerStore.items)) return null;

  return customerStore.items.find(c =>
    c.tradeName === props.ticket.customer ||
    c.companyName === props.ticket.customer ||
    c.name === props.ticket.customer
  );
});

const customerNameDisplay = computed(() => {
  if (customerData.value) {
    return customerData.value.tradeName || customerData.value.companyName || customerData.value.name;
  }
  return props.ticket?.customer || 'Sem Cliente';
});

const getPriorityType = (priority: string) => {
  const map: Record<string, string> = { low: 'info', medium: 'primary', high: 'warning', urgent: 'danger' };
  return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };
  return map[priority] || priority || 'Baixa';
};
</script>