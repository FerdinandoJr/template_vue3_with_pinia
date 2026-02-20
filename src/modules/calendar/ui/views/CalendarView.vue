<template>
  <div class="h-[calc(100vh-100px)] flex flex-col gap-4 font-sans">
    
    <div class="flex flex-col md:flex-row justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100 gap-4 shrink-0">
      
      <div class="flex items-center gap-4">
        <div class="flex bg-slate-100 p-1 rounded-lg">
          <button @click="store.prevPeriod" class="p-2 hover:bg-white hover:shadow-sm rounded-md transition text-slate-500 text-xs">◀</button>
          <button @click="store.goToToday" class="px-4 text-xs font-black text-slate-700 hover:text-blue-600 transition">Hoje</button>
          <button @click="store.nextPeriod" class="p-2 hover:bg-white hover:shadow-sm rounded-md transition text-slate-500 text-xs">▶</button>
        </div>
        <h2 class="text-lg font-bold text-slate-800 capitalize min-w-[150px]">
          {{ periodLabel }}
        </h2>
      </div>

      <div class="flex items-center gap-2">
         <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Visualizar:</span>
         <div class="relative group min-w-[160px]">
            <select 
              v-model="store.selectedAgent" 
              class="appearance-none bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 block w-full px-3 py-2 font-bold cursor-pointer transition-shadow shadow-sm"
            >
              <option value="all">👥 Todos da Equipe</option>
              <option value="Eu">👤 Apenas Eu</option>
              <option value="Ana Silva">👩 Ana Silva</option>
              <option value="Carlos Mendes">👨 Carlos Mendes</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
         </div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="hidden md:flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-500">
          <button 
            @click="store.viewType = 'month'" 
            :class="store.viewType === 'month' ? 'bg-white shadow-sm text-blue-600' : 'hover:text-slate-700'" 
            class="px-3 py-1.5 rounded-md transition flex items-center gap-2"
          >
            📅 Mês
          </button>
          <button 
            @click="store.viewType = 'week'" 
            :class="store.viewType === 'week' ? 'bg-white shadow-sm text-blue-600' : 'hover:text-slate-700'" 
            class="px-3 py-1.5 rounded-md transition flex items-center gap-2"
          >
            ⏳ Semana
          </button>
          <button 
            @click="store.viewType = 'day'" 
            :class="store.viewType === 'day' ? 'bg-white shadow-sm text-blue-600' : 'hover:text-slate-700'" 
            class="px-3 py-1.5 rounded-md transition flex items-center gap-2"
          >
            📆 Dia
          </button>
        </div>
        
        <button @click="openModalForCreate" class="flex-1 md:flex-none flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-200 active:scale-95">
          <span>+</span> Novo
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
      
      <component 
        :is="store.viewType === 'month' ? CalendarGrid : WeekGrid"
        :mode="store.viewType === 'day' ? 'day' : 'week'" 
        :current-month="store.currentMonth"
        :current-date="store.currentMonth"
        :appointments="store.appointments"
        :is-blocked="store.isDateBlocked"
        :get-appointments="store.getAppointmentsByDate"
        @date-click="handleDateClick"
        @date-contextmenu="store.toggleBlockDate"
        @update-appointment="handleUpdateAppointment" 
        @edit="openModalForEdit"
        @select-slot="handleSlotClick"
        class="flex-1 h-full shadow-lg shadow-slate-200/50"
      />

      <UpcomingList 
        class="hidden xl:flex"
        :appointments="store.upcomingAppointments"
        :count-today="countToday"
        :count-pending="countPending"
      />

    </div>

    <AppointmentModal 
      :is-open="isModalOpen" 
      :edit-data="editingAppointment"
      @close="closeModal" 
      @save="handleSave" 
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAgendaStore } from '../store/calendar.store';
import CalendarGrid from '../components/CalendarGrid.vue';
import WeekGrid from '../components/WeekGrid.vue';
import UpcomingList from '../components/UpcomingList.vue';
import AppointmentModal from '../components/AppointmentModal.vue';
import type { Appointment } from '../../domain/entities/Appointment';

const store = useAgendaStore();
const isModalOpen = ref(false);
const editingAppointment = ref<Appointment | undefined>(undefined);

const periodLabel = computed(() => {
    const d = store.currentMonth;
    if (store.viewType === 'month') {
        return d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    } else if (store.viewType === 'day') {
        return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    } else {
        const start = new Date(d);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.getDate()} - ${end.getDate()} ${end.toLocaleString('pt-BR', { month: 'short' })}`;
    }
});

const countToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return store.appointments.filter(a => a.date === today).length;
});
const countPending = computed(() => store.appointments.filter(a => a.status === 'pending').length);

const openModalForCreate = () => {
    editingAppointment.value = undefined; 
    isModalOpen.value = true;
};

const openModalForEdit = (apt: Appointment) => {
    editingAppointment.value = { ...apt }; 
    isModalOpen.value = true;
};

const handleSlotClick = (payload: { date: Date, time: string }) => {
    const dateStr = payload.date.toISOString().split('T')[0] ?? '';
    
    const timeParts = payload.time.split(':').map(Number);
    const h = timeParts[0] ?? 0;
    const m = timeParts[1] ?? 0;
    
    const endH = (h + 1) % 24;
    const endTimeStr = `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

    const newDraft: Appointment = {
        id: 0,
        title: '',
        clientId: 0,
        clientName: '',
        agent: store.selectedAgent === 'all' ? 'Eu' : store.selectedAgent,
        date: dateStr,
        time: payload.time,
        endTime: endTimeStr,
        type: 'meeting',
        status: 'confirmed',
        color: '#3b82f6',
        description: ''
    };
    
    openModalForEdit(newDraft);
};

const closeModal = () => {
    isModalOpen.value = false;
    editingAppointment.value = undefined;
}

const handleDateClick = (date: Date) => {
    store.currentMonth = date;
    store.viewType = 'day';
};

const handleSave = async (data: Appointment) => {
  const result = await store.addAppointment(data);
  if (result.success) {
    closeModal();
  }
};

const handleDelete = async (id: number) => {
    await store.deleteAppointment(id);
};

const handleUpdateAppointment = async (payload: { id: number, date: Date, time: string, endTime?: string }) => {
    await store.updateAppointmentTime(payload.id, payload.date, payload.time, payload.endTime);
};

onMounted(() => {
    store.loadAgenda();
});
</script>