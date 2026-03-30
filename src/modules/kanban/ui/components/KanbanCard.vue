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
        <div v-if="displayAvatars.length > 0" class="flex -space-x-2 overflow-hidden px-1">
          <el-avatar v-for="(av, idx) in displayAvatars" :key="idx" :size="28"
            class="border-2 border-white bg-indigo-600 font-bold text-[11px] shadow-sm text-white hover:z-10 transition-transform hover:scale-110 cursor-pointer"
            :title="av.title">
            {{ av.initial }}
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

const props = defineProps<{ ticket: ITicket }>();

const teamMembers = [
  { id: '1', name: 'Admin (Você)' },
  { id: '2', name: 'João Atendimento' },
  { id: '3', name: 'Maria Vendas' }
];

const displayAvatars = computed(() => {
  const assignees = (props.ticket as any)?.assignees;

  // CORREÇÃO: Tipagem explícita para o TypeScript parar de acusar 'any[]'
  const avatarsList: { initial: string; title: string }[] = [];

  // 1. Lê a equipe salva ativamente via Modal (baseada em IDs numéricos)
  if (Array.isArray(assignees) && assignees.length > 0) {
    assignees.forEach(uid => {
      const member = teamMembers.find(m => String(m.id) === String(uid));
      if (member) {
        avatarsList.push({ initial: member.name.charAt(0).toUpperCase(), title: member.name });
      } else {
        avatarsList.push({ initial: 'U', title: 'User' });
      }
    });
    return avatarsList;
  }

  // 2. Fallback de Segurança: Lê as iniciais caso venha direto do mock inicial
  const oldAvatars = (props.ticket as any)?.avatars;
  if (Array.isArray(oldAvatars) && oldAvatars.length > 0) {
    oldAvatars.forEach(av => {
      avatarsList.push({ initial: String(av).charAt(0).toUpperCase(), title: 'User' });
    });
  }

  return avatarsList;
});

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