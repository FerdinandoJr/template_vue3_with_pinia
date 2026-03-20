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

    <h4 class="font-bold text-slate-800 text-sm mb-3 leading-tight line-clamp-2" :title="ticket?.title">
      {{ ticket?.title || 'Sem Título' }}
    </h4>

    <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">

      <div class="flex items-center">
        <div v-if="ticketAssignees.length > 0" class="flex -space-x-2 overflow-hidden px-1">
          <el-avatar v-for="uid in ticketAssignees" :key="uid" :size="28"
            class="border-2 border-white bg-indigo-600 font-bold text-[11px] shadow-sm text-white hover:z-10 transition-transform hover:scale-110 cursor-pointer"
            :title="getTeamMemberName(uid)">
            {{ getTeamMemberName(uid).charAt(0).toUpperCase() }}
          </el-avatar>
        </div>

        <div v-else>
          <el-tag size="small" type="info" effect="plain" class="!border-slate-200 text-slate-400 !rounded-full">
            Não atribuído
          </el-tag>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';

const props = defineProps<{
  ticket: ITicket
}>();

const ticketAssignees = computed<string[]>(() => {
  return (props.ticket as any)?.assignees || [];
});

const teamMembers = [
  { id: 'u1', name: 'João Silva' },
  { id: 'u2', name: 'Maria Santos' },
  { id: 'u3', name: 'Ana Costa' },
  { id: 'u4', name: 'Pedro Almeida' },
];

const getTeamMemberName = (id: string) => {
  const member = teamMembers.find(m => m.id === id);
  return member ? member.name : 'User';
};

const getPriorityType = (priority: string) => {
  const map: Record<string, string> = {
    low: 'info',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger'
  };
  return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente'
  };
  return map[priority] || priority || 'Baixa';
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>