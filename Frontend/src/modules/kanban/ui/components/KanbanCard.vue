<template>
  <div
    class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all relative group"
    :class="{ 'cursor-grab active:cursor-grabbing': draggable !== false, 'cursor-not-allowed opacity-60': draggable === false }"
    :draggable="draggable !== false"
    @dragstart="draggable !== false ? onDragStart($event) : null">
    <div class="flex justify-between items-start mb-2">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ getDisplayId(ticket) }}</span>
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
        {{ tag.label || tag.name || tag }}
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
import { computed, onMounted, ref } from 'vue';
import type { ITicket } from '@/modules/tickets/domain/entities/Ticket';
import { useCalendarStore } from '@/modules/calendar/ui/store/calendar.store';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

const props = defineProps<{ ticket: ITicket; draggable?: boolean }>();

const getDisplayId = (ticket: any) => {
  if (ticket?.ticketNumber) return ticket.ticketNumber;
  if (ticket?.ticketId) return 'TKT-' + ticket.ticketId.slice(0, 8).toUpperCase();
  if (ticket?.id) return 'TKT-' + ticket.id.slice(0, 8).toUpperCase();
  return 'Novo';
};

const calendarStore = useCalendarStore() as any;
const authStore = useAuthStore() as any;

onMounted(async () => {
  if (!calendarStore.availableUsers || calendarStore.availableUsers.length === 0) {
    await calendarStore.fetchAgendaData();
  }
});

const getAllUsers = () => {
  const users = calendarStore.availableUsers || [];
  const currentUser = authStore.user;
  if (currentUser && !users.find((u: any) => u.id === currentUser.id)) {
    return [currentUser, ...users];
  }
  return users;
};

const getTagType = (tag: any) => {
  if (!tag) return 'info';
  const label = tag.label || tag.name || '';
  const colorClass = tag.colorClass || '';
  if (colorClass.includes('red') || label === 'Bug') return 'danger';
  if (colorClass.includes('pink') || label === 'Crítico') return 'danger';
  if (colorClass.includes('orange') || label === 'Urgente') return 'warning';
  if (colorClass.includes('green') || label === 'Nova Funcionalidade') return 'success';
  if (colorClass.includes('blue') || label === 'Melhoria') return 'primary';
  return 'info';
};

const displayAvatars = computed(() => {
  const assignees = (props.ticket as any)?.assignees;
  const avatarsList: { initial: string; title: string }[] = [];
  
  const allUsers = getAllUsers();

  if (Array.isArray(assignees) && assignees.length > 0) {
    assignees.forEach((uid: any) => {
      const user = allUsers.find((u: any) => String(u.id) === String(uid));
      if (user && user.name) {
        avatarsList.push({ initial: user.name.charAt(0).toUpperCase(), title: user.name });
      } else if (uid) {
        avatarsList.push({ initial: String(uid).charAt(0).toUpperCase(), title: String(uid) });
      }
    });
  }
  
  const customerId = (props.ticket as any)?.customerId;
  if (customerId) {
    const customer = (props.ticket as any)?.customer;
    if (customer) {
      const name = customer.name || customer.tradeName || customer.companyName || 'Cliente';
      avatarsList.push({ initial: name.charAt(0).toUpperCase(), title: name });
    }
  }

  return avatarsList;
});

const onDragStart = (event: DragEvent) => {
  if (props.draggable === false) {
    event.preventDefault();
    return;
  }
  event.stopPropagation();
  const idToSend = props.ticket?.ticketId || props.ticket?.id;
  if (event.dataTransfer) {
    event.dataTransfer.setData('ticketId', String(idToSend));
    event.dataTransfer.setData('type', 'card');
    event.dataTransfer.effectAllowed = 'move';
  }
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