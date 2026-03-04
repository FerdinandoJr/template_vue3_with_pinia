<template>
  <div class="flex h-full w-full bg-[#f8fafc] overflow-hidden">

    <AgendaSidebar @date-change="handleDateChange" />

    <div
      class="flex-1 flex flex-col min-w-0 bg-white shadow-xl shadow-slate-200/50 m-3 rounded-2xl border border-slate-200 overflow-hidden relative">

      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-20">
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calendário</span>
            <h2 class="text-2xl font-black text-slate-800 capitalize tracking-tight min-w-[150px]">
              {{ currentTitle || 'Carregando...' }}
            </h2>
          </div>

          <div class="flex gap-1 bg-slate-50 p-1 rounded-lg ml-4 border border-slate-100">
            <el-button :icon="ArrowLeft" @click="handlePrev" circle size="small" />
            <el-button @click="handleToday" size="small" class="!font-bold !px-4">Hoje</el-button>
            <el-button :icon="ArrowRight" @click="handleNext" circle size="small" />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <el-radio-group v-model="viewMode" size="default">
            <el-radio-button label="dayGridMonth">Mês</el-radio-button>
            <el-radio-button label="timeGridWeek">Semana</el-radio-button>
            <el-radio-button label="timeGridDay">Dia</el-radio-button>
          </el-radio-group>

          <el-button type="primary" size="large"
            class="!rounded-xl !px-6 !border-none shadow-md hover:brightness-110 transition-all active:scale-95"
            style="background-color: rgb(51, 126, 204);" @click="openCreateModal()">
            <el-icon class="mr-2">
              <Plus />
            </el-icon> Novo Agendamento
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
import { useAgendaStore } from '../store/agenda.store';
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import ProfessionalCalendar from '../components/ProfessionalCalendar.vue';
import AgendaSidebar from '../components/AgendaSidebar.vue';
import EventModal from '../components/EventModal.vue';

const store = useAgendaStore();

const viewMode = ref('dayGridMonth');
const currentTitle = ref('');
const calendarComponentRef = ref<any>(null);
const isModalOpen = ref(false);
const currentEvent = ref<any>(null);

const getApi = () => calendarComponentRef.value?.getApi();

// Sincroniza a data do calendário principal com o mini calendário da sidebar
const syncStoreDate = () => {
  const api = getApi();
  if (api) store.setSelectedDate(api.getDate());
};

const handlePrev = () => { if (getApi()) { getApi().prev(); syncStoreDate(); } };
const handleNext = () => { if (getApi()) { getApi().next(); syncStoreDate(); } };
const handleToday = () => { if (getApi()) { getApi().today(); syncStoreDate(); } };

const handleDatesSet = (title: string) => {
  currentTitle.value = title;
  syncStoreDate();
};

const handleDateChange = (date: Date) => {
  if (getApi()) getApi().gotoDate(date);
};

const openCreateModal = (dateStr?: string) => {
  const rawDate = typeof dateStr === 'string' ? dateStr : new Date().toISOString();
  currentEvent.value = { date: rawDate.split('T')[0], time: '09:00' };
  isModalOpen.value = true;
};

const openEditModal = (event: any) => {
  currentEvent.value = { ...event };
  isModalOpen.value = true;
};

const handleSaveEvent = (eventData: any) => {
  eventData.id ? store.updateEvent(eventData) : store.addEvent(eventData);
  ElMessage.success(eventData.id ? 'Atualizado!' : 'Agendado!');
  isModalOpen.value = false;
};

const handleUpdateDate = (event: any) => {
  store.updateEvent(event);
  ElMessage({ message: 'Movido com sucesso', type: 'success', plain: true });
};

const handleDeleteEvent = async (id: string) => {
  try {
    await ElMessageBox.confirm('Excluir este agendamento?', 'Atenção', { type: 'warning' });
    store.deleteEvent(id);
    isModalOpen.value = false;
    ElMessage.success('Excluído.');
  } catch { }
};

onMounted(() => { store.fetchAgendaData(); });
</script>

<style scoped>
/* Estilo do Rádio (Mês/Semana/Dia) */
:deep(.el-radio-button__inner) {
  border: none !important;
  background-color: transparent !important;
  font-weight: 600;
  color: #64748b;
}

/* Aplicação da cor sugerida no item ativo do rádio (Mês) */
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #f1f5f9 !important;
  color: rgb(51, 126, 204) !important;
  box-shadow: none !important;
  border-radius: 6px !important;
}
</style>