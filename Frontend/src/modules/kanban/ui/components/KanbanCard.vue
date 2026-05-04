<template>
  <div
    class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all relative group"
    :class="{ 'cursor-grab active:cursor-grabbing': draggable !== false, 'cursor-not-allowed opacity-60': draggable === false }"
    :draggable="draggable !== false"
    @dragstart="draggable !== false ? onDragStart($event) : null">
    <div class="flex justify-between items-start mb-2">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ displayId }}</span>
      <el-tag size="small" :type="getPriorityType(ticket?.priority as string)" effect="plain"
        class="font-semibold border-none">
        {{ getPriorityLabel(ticket?.priority as string) }}
      </el-tag>
    </div>

    <h4 class="font-bold text-slate-800 text-sm mb-2 leading-tight line-clamp-2" :title="ticket?.title">
      {{ ticket?.title || 'Sem Título' }}
    </h4>

    <div v-if="ticket?.tags?.length" class="flex flex-wrap gap-1 mb-3">
      <el-tag
        v-for="(tag, idx) in (ticket?.tags || []).slice(0, 3)"
        :key="idx"
        size="small"
        :type="getTagType(tag)"
        effect="plain"
        class="!text-[10px] !px-1.5 !py-0 font-medium border-none">
        {{ (tag as any).label || (tag as any).name || tag }}
      </el-tag>
      <el-tag v-if="(ticket?.tags?.length || 0) > 3" size="small" type="info" effect="plain" class="!text-[10px] !px-1.5 !py-0 font-medium border-none">
        +{{ (ticket?.tags?.length || 0) - 3 }}
      </el-tag>
    </div>

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
import { computed, onMounted } from 'vue';
import type { IKanbanCard } from '../../domain/entities/kanban-card';
import { useCalendarStore } from '@/modules/calendar/ui/store/calendar.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';
import { useKanbanStore } from '../store/kanban.store';

const props = defineProps<{ ticket: IKanbanCard; draggable?: boolean }>();

const calendarStore = useCalendarStore() as any;
const authStore = useAuthStore() as any;
const kanbanStore = useKanbanStore() as any;

const displayId = computed(() => {
  const card = props.ticket as any;
  if (!card) return 'Novo';
  
  if (card.ticketNumber) return card.ticketNumber;
  
  const searchId = card.ticketId || card.id;
  if (searchId) {
    const linkedTicket = kanbanStore.allTickets?.find((t: any) => String(t.id) === String(searchId));
    if (linkedTicket?.ticketNumber) return linkedTicket.ticketNumber;
  }
  
  if (card.id) return 'CARD-' + String(card.id).slice(0, 8).toUpperCase();
  return 'Novo';
});

onMounted(async () => {
  if (!calendarStore.availableUsers || calendarStore.availableUsers.length === 0) {
    await calendarStore.fetchAgendaData();
  }
});

const displayAvatars = computed(() => {
  const assignees = (props.ticket as any)?.assignees;
  const avatarsList: { initial: string; title: string }[] = [];
  
  const allUsers = getAllUsers();
  
  if (Array.isArray(assignees) && assignees.length > 0) {
    assignees.forEach((uid: any) => {
      const user = allUsers.find((u: any) => String(u.id) === String(uid));
      if (user) {
        avatarsList.push({
          initial: (user.name || '?').charAt(0).toUpperCase(),
          title: user.name || 'Usuário'
        });
      }
    });
  }
  return avatarsList;
});

function getAllUsers(): any[] { const kanbanStore = useKanbanStore(); const all = kanbanStore.allUsers || []; const activeUsers = [...all.filter(u => u.isActive !== false)]; const authUser = authStore.user; if (authUser && !activeUsers.find((u) => String(u.id) === String(authUser.id))) { activeUsers.push({ ...authUser }); } return activeUsers; }

const getPriorityType = (priority: string) => {
  const map: Record<string, string> = { low: 'info', medium: 'warning', high: 'danger', urgent: 'danger' };
  return map[priority] || 'info';
};

const getPriorityLabel = (priority: string) => {
  const map: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };
  return map[priority] || priority || 'Média';
};

const getTagType = (tag: any) => {
  const label = tag?.label || tag?.name || String(tag);
  if (label === 'Bug') return 'danger';
  if (label === 'Crítico') return 'danger';
  if (label === 'Urgente') return 'warning';
  if (label === 'Nova Funcionalidade') return 'success';
  if (label === 'Melhoria') return 'primary';
  if (label === 'Geral') return 'info';
  return 'info';
};

const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(props.ticket));
  }
};
</script>
