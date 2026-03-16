<template>
  <div
    class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-grab hover:shadow-md hover:border-blue-300 active:cursor-grabbing transition-all relative group">

    <div class="flex justify-between items-start mb-2">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{{ ticket.id }}</span>
      <el-tag size="small" :type="getPriorityType(ticket.priority)" effect="plain" class="font-semibold border-none">
        {{ getPriorityLabel(ticket.priority) }}
      </el-tag>
    </div>

    <h4 class="font-bold text-slate-800 text-sm mb-2 leading-tight line-clamp-2">
      {{ ticket.title }}
    </h4>

    <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <el-avatar :size="24" class="bg-blue-50 text-blue-600 text-xs font-bold">
          {{ ticket.customer.charAt(0).toUpperCase() }}
        </el-avatar>
        <span class="text-xs font-medium text-slate-600 truncate max-w-[120px]">{{ ticket.customer }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';
import { TicketPriority } from '@/modules/tickets/domain/valueObjects/ticket-priority.enum';

defineProps<{ ticket: ITicket }>();

const getPriorityType = (priority: string) => {
  const map: Record<string, string> = { low: 'info', medium: 'primary', high: 'warning', urgent: 'danger' };
  return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };
  return map[priority] || priority;
};
</script>