<template>
  <div class="flex h-full w-full bg-[#f8fafc] overflow-hidden">
    <AgendaSidebar class="hidden lg:flex" @date-change="handleDateChange" />

    <div
      class="flex-1 flex flex-col min-w-0 bg-white shadow-xl shadow-slate-200/50 m-3 rounded-2xl border border-slate-200 overflow-hidden relative">
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-20">
        <div class="flex items-center gap-6">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calendário</span>
            <h2 class="text-2xl font-black text-slate-800 capitalize tracking-tight min-w-[150px]">
              {{ currentTitle || 'Carregando...' }}
            </h2>
          </div>

          <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 hidden sm:flex">
            <el-button :icon="ArrowLeft" @click="handlePrev" circle text
              class="hover:bg-white hover:shadow-sm transition-all" />
            <el-button @click="handleToday" text
              class="!font-bold !text-slate-600 hover:bg-white hover:shadow-sm transition-all rounded-lg">
              Hoje
            </el-button>
            <el-button :icon="ArrowRight" @click="handleNext" circle text
              class="hover:bg-white hover:shadow-sm transition-all" />
          </div>
        </div>

        <div class="flex items-center gap-6">
          <el-radio-group v-model="viewMode" class="custom-segmented-control hidden md:inline-flex">
            <el-radio-button value="dayGridMonth">Mês</el-radio-button>
            <el-radio-button value="timeGridWeek">Semana</el-radio-button>
            <el-radio-button value="timeGridDay">Dia</el-radio-button>
            <el-radio-button value="listMonth">Lista</el-radio-button>
          </el-radio-group>

          <el-button type="primary" size="large" class="custom-primary-btn shadow-md shadow-blue-500/30"
            @click="openCreateModal()">
            <el-icon class="mr-2">
              <Plus />
            </el-icon>
            <span class="hidden sm:inline">Novo Agendamento</span>
          </el-button>
        </div>
      </div>

      <div class="flex-1 min-h-0 relative z-0">
        <ProfessionalCalendar ref="calendarComponentRef" :current-view="viewMode" @dates-set="handleDatesSet"
          @create-event="openCreateModal" @edit-event="openEditModal" @update-event-date="handleUpdateDate" />
      </div>
    </div>

    <EventModal :is-open="isModalOpen" :event-data="currentEvent" @close="isModalOpen = false" @save="handleSaveEvent"
      @delete="handleDeleteEvent" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCalendarStore } from '../store/calendar.store';
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ProfessionalCalendar from '../components/ProfessionalCalendar.vue';
import AgendaSidebar from '../components/CalendarSidebar.vue';
import EventModal from '../components/EventModal.vue';

const store = useCalendarStore();
const viewMode = ref('dayGridMonth');
const currentTitle = ref('');
const calendarComponentRef = ref<any>(null);
const isModalOpen = ref(false);
const currentEvent = ref<any>(null);

const getApi = () => calendarComponentRef.value?.getApi();

const syncStoreDate = () => {
  const api = getApi();
  if (api) store.setSelectedDate(api.getDate());
};

const handlePrev = () => { if (getApi()) { getApi().prev(); syncStoreDate(); } };
const handleNext = () => { if (getApi()) { getApi().next(); syncStoreDate(); } };
const handleToday = () => { if (getApi()) { getApi().today(); syncStoreDate(); } };
const handleDatesSet = (title: string) => { currentTitle.value = title; syncStoreDate(); };
const handleDateChange = (date: Date) => { if (getApi()) getApi().gotoDate(date); };

const openCreateModal = (dateStr?: string) => {
  const rawDate = typeof dateStr === 'string' ? dateStr : new Date().toISOString();
  currentEvent.value = { date: rawDate.split('T')[0], time: '09:00' };
  isModalOpen.value = true;
};

const openEditModal = (event: any) => { currentEvent.value = { ...event }; isModalOpen.value = true; };

const handleSaveEvent = (eventData: any) => {
  eventData.id ? store.updateEvent(eventData) : store.addEvent(eventData);
  ElMessage.success(eventData.id ? 'Atualizado!' : 'Agendado!');
  isModalOpen.value = false;
};

const handleUpdateDate = (event: any) => { store.updateEvent(event); ElMessage({ message: 'Movido', type: 'success', plain: true }); };

const handleDeleteEvent = async (id: string) => {
  try { await ElMessageBox.confirm('Excluir?', 'Atenção', { type: 'warning' }); store.deleteEvent(id); isModalOpen.value = false; ElMessage.success('Excluído.'); } catch { }
};

onMounted(() => { store.fetchAgendaData(); });
</script>

<style>
/* CSS liberado do "scoped" para forçar o estilo no Element Plus */
.custom-segmented-control {
  background-color: #f1f5f9 !important;
  padding: 4px !important;
  border-radius: 12px !important;
  display: inline-flex !important;
  gap: 2px !important;
}

.custom-segmented-control .el-radio-button__inner {
  border: none !important;
  background-color: transparent !important;
  color: #64748b !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
  box-shadow: none !important;
  transition: all 0.2s ease-in-out !important;
}

.custom-segmented-control .el-radio-button:hover .el-radio-button__inner {
  color: #3b82f6 !important;
}

.custom-segmented-control .el-radio-button__original-radio:checked+.el-radio-button__inner {
  background-color: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

.custom-primary-btn {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  font-weight: 700 !important;
  border-radius: 12px !important;
  padding: 0 24px !important;
}
</style>