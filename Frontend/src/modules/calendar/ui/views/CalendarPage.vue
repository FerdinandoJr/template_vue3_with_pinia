<template>
  <div class="absolute inset-0 flex flex-1 h-full min-h-0 w-full bg-[#f8fafc] overflow-hidden animate-fade-in border-t border-slate-200">
    <CalendarSidebar class="hidden lg:flex shrink-0" @date-change="handleDateChange" />

    <div class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden relative">
      
      <div class="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white shrink-0 z-20 gap-4">
        <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Agenda Corporativa</span>
            <h2 class="text-xl sm:text-2xl font-black text-slate-800 capitalize tracking-tight min-w-[180px]">
              {{ currentTitle || 'Carregando...' }}
            </h2>
          </div>

          <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <el-button :icon="ArrowLeft" @click="handlePrev" circle text class="hover:!bg-white hover:shadow-sm transition-all" />
            <el-button @click="handleToday" text class="!font-black !text-slate-600 hover:!bg-white hover:shadow-sm transition-all rounded-lg px-4">
              Hoje
            </el-button>
            <el-button :icon="ArrowRight" @click="handleNext" circle text class="hover:!bg-white hover:shadow-sm transition-all" />
          </div>
        </div>

        <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <el-radio-group v-model="viewMode" class="custom-premium-tabs hidden sm:inline-flex">
            <el-radio-button value="dayGridMonth">Mês</el-radio-button>
            <el-radio-button value="timeGridWeek">Semana</el-radio-button>
            <el-radio-button value="timeGridDay">Dia</el-radio-button>
            <el-radio-button value="listMonth">Lista</el-radio-button>
          </el-radio-group>

          <el-button type="primary" size="large" class="!bg-blue-600 !border-none !rounded-xl !font-black shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform !h-12 px-6"
            @click="openCreateModal()">
            <el-icon class="mr-2 text-lg"><Plus /></el-icon>
            <span class="hidden md:inline">Novo Registo</span>
          </el-button>
        </div>
      </div>

      <div class="flex-1 min-h-0 relative z-0">
        <ProfessionalCalendar 
          ref="calendarComponentRef" 
          :current-view="viewMode" 
          @dates-set="handleDatesSet"
          @create-event="openCreateModal" 
          @edit-event="openEditModal" 
          @update-event-date="handleUpdateDate" 
        />
      </div>
    </div>

    <EventModal v-if="isModalOpen" 
      :is-open="isModalOpen" 
      :event-data="currentEvent" 
      @close="isModalOpen = false" 
      @save="handleSaveEvent"
      @delete="handleDeleteEvent" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useCalendarStore } from '../store/calendar.store';
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ProfessionalCalendar from '../components/ProfessionalCalendar.vue';
import CalendarSidebar from '../components/CalendarSidebar.vue';
import EventModal from '../components/EventModal.vue';

const store = useCalendarStore();
const viewMode = ref('dayGridMonth');
const currentTitle = ref('');
const calendarComponentRef = ref<any>(null);
const isModalOpen = ref(false);
const currentEvent = ref<any>({});

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
  currentEvent.value = { date: rawDate.split('T')[0], time: '09:00', endTime: '10:00' };
  isModalOpen.value = false;
  nextTick(() => { isModalOpen.value = true; });
};

const openEditModal = (event: any) => { 
  console.log('[CalendarPage] openEditModal received event:', JSON.parse(JSON.stringify(event)));
  currentEvent.value = { ...event }; 
  isModalOpen.value = true; 
};

const handleSaveEvent = (eventData: any) => {
  eventData.id ? store.updateEvent(eventData) : store.addEvent(eventData);
  ElMessage.success({ message: eventData.id ? 'Registo atualizado!' : 'Agendamento concluído!', customClass: 'font-bold' });
  isModalOpen.value = false;
};

const handleUpdateDate = (event: any) => { 
  store.updateEvent(event); 
  ElMessage({ message: 'Evento movido com sucesso', type: 'success', plain: true }); 
};

const handleDeleteEvent = async (id: string) => {
  try { 
    await ElMessageBox.confirm('Deseja excluir permanentemente este registo?', 'Atenção', { 
      confirmButtonText: 'Sim, Excluir',
      cancelButtonText: 'Cancelar',
      type: 'warning',
      customClass: 'premium-msg-box'
    }); 
    store.deleteEvent(id); 
    isModalOpen.value = false; 
    ElMessage.success('Registo removido.'); 
  } catch { }
};

onMounted(() => { store.fetchAgendaData(); });
</script>

<style>
.custom-premium-tabs {
  background-color: #f1f5f9 !important;
  padding: 4px !important;
  border-radius: 14px !important;
  display: inline-flex !important;
  gap: 2px !important;
  border: 1px solid #e2e8f0 !important;
}

.custom-premium-tabs .el-radio-button__inner {
  border: none !important;
  background-color: transparent !important;
  color: #64748b !important;
  font-weight: 800 !important;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px !important;
  border-radius: 10px !important;
  padding: 10px 18px !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

.custom-premium-tabs .el-radio-button__original-radio:checked+.el-radio-button__inner {
  background-color: #ffffff !important;
  color: #3b82f6 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
}
</style>