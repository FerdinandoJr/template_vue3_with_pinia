<template>
  <div class="flex flex-col h-[calc(100vh-5rem)] bg-slate-50/50 p-6 print-container">

    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 shrink-0 no-print">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight mb-6">Gestão de Atendimentos</h1>

      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Buscar
            Chamado</label>
          <el-input v-model="filters.search" placeholder="Protocolo, cliente..." clearable :prefix-icon="Search"
            size="large" class="custom-input" />
        </div>

        <div class="w-48">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Status</label>
          <el-select v-model="filters.status" size="large" class="w-full custom-input">
            <el-option label="Todos" value="all" />
            <el-option label="Em Andamento" value="in_progress" />
            <el-option label="Aguardando" value="waiting" />
            <el-option label="Concluídos" value="finished" />
          </el-select>
        </div>

        <div class="w-80">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Período de
            Abertura</label>
          <el-date-picker v-model="filters.dateRange" type="daterange" unlink-panels range-separator="até"
            start-placeholder="Início" end-placeholder="Fim" :shortcuts="shortcuts" format="DD/MM/YY"
            value-format="DD/MM/YYYY" size="large" class="!w-full custom-date-picker" />
        </div>
      </div>
    </div>

    <div
      class="flex-1 overflow-hidden flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm relative no-print">
      <div
        class="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">
        <div class="col-span-2">Protocolo</div>
        <div class="col-span-3">Cliente</div>
        <div class="col-span-4">Assunto / Movimentação</div>
        <div class="col-span-2">Tempo Ativo</div>
        <div class="col-span-1 text-center">Status</div>
      </div>

      <ul class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2" v-infinite-scroll="store.loadMoreServices"
        :infinite-scroll-disabled="store.loading">
        <li v-for="service in filteredServices" :key="service.id" @click="openServiceDetails(service)"
          class="grid grid-cols-12 gap-4 items-center px-4 py-4 bg-white border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md rounded-xl cursor-pointer transition-all group">

          <div class="col-span-2 flex items-center gap-3">
            <div class="w-1.5 h-10 rounded-full" :class="getStatusBarColor(service.status)"></div>
            <span class="font-mono text-sm font-black text-slate-600 group-hover:text-blue-600 tracking-tight">#{{
              service.protocol }}</span>
          </div>

          <div class="col-span-3 truncate pr-4">
            <p class="text-sm font-bold text-slate-800 truncate">{{ service.customerName }}</p>
            <p class="text-[10px] font-bold text-slate-400 uppercase">{{ service.document }}</p>
          </div>

          <div class="col-span-4 truncate pr-4">
            <p class="text-sm font-semibold text-slate-700 truncate">{{ service.subject }}</p>
            <p class="text-xs text-slate-500 truncate mt-0.5 font-medium italic">{{ service.lastAction }}</p>
          </div>

          <div class="col-span-2 flex items-center gap-2">
            <el-icon :size="18"
              :class="service.status === 'in_progress' ? 'text-emerald-500 animate-spin-slow' : 'text-slate-300'">
              <Timer />
            </el-icon>
            <span class="text-sm font-mono font-bold text-slate-700">{{ service.timeElapsed }}</span>
          </div>

          <div class="col-span-1 flex justify-center">
            <el-tag :type="getStatusTag(service.status).type" effect="dark" size="small"
              class="!border-none !font-black px-3 !rounded-md">
              {{ getStatusTag(service.status).label }}
            </el-tag>
          </div>
        </li>
        <div v-if="store.loading" class="flex justify-center py-4"><el-icon class="animate-spin text-blue-500"
            :size="24">
            <Loading />
          </el-icon></div>
      </ul>
    </div>

    <el-dialog v-model="isModalOpen" width="1000px" top="5vh" class="!rounded-[24px] overflow-hidden"
      :show-close="false">
      <template #header>
        <div class="flex justify-between items-center pb-4 border-b border-slate-100">
          <div class="flex items-center gap-5">
            <el-button circle @click="isModalOpen = false" class="!border-none hover:bg-slate-100" size="large"><el-icon
                :size="20">
                <ArrowLeft />
              </el-icon></el-button>
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-black text-slate-800 font-mono tracking-tighter">#{{ selectedService?.protocol
                }}</h2>
                <el-tag :type="getStatusTag(selectedService?.status).type" effect="dark"
                  class="!font-black !border-none px-4 !rounded-lg">
                  {{ getStatusTag(selectedService?.status).label }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <el-button type="info" plain :icon="Printer" @click="handlePrint"
              class="!rounded-xl font-bold">Imprimir</el-button>
            <el-button type="success" :icon="Check" v-if="selectedService?.status !== 'finished'"
              @click="handleFinishService" class="!rounded-xl !font-black !bg-emerald-500 px-8">FINALIZAR</el-button>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4" v-if="selectedService">
        <div class="col-span-2 flex flex-col h-[65vh] overflow-hidden">
          <h3
            class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 shrink-0">
            <el-icon :size="16">
              <Document />
            </el-icon> MOVIMENTAÇÃO DO CHAMADO
          </h3>
          <div class="flex-1 overflow-y-auto custom-scrollbar pr-6 pb-6">
            <el-timeline>
              <el-timeline-item v-for="(event, index) in selectedService.history" :key="index" :timestamp="event.date"
                placement="top" size="large" :type="index === 0 ? 'primary' : ''">
                <div
                  class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-200">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="text-base font-black text-slate-800 leading-tight">{{ event.title }}</h4>
                    <span class="text-[10px] font-black px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase">{{
                      event.author }}</span>
                  </div>
                  <p class="text-sm text-slate-600 font-medium leading-relaxed">{{ event.description }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>

        <div class="col-span-1 border-l border-slate-100 pl-8 flex flex-col">
          <div class="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-8">
            <h3 class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">TEMPO ATIVO</h3>
            <div class="flex items-end gap-3 text-blue-700">
              <el-icon :size="32" class="mb-1">
                <Timer />
              </el-icon>
              <span class="text-4xl font-mono font-black tracking-tighter">{{ selectedService.timeElapsed }}</span>
            </div>
          </div>

          <div class="space-y-6">
            <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">DADOS DO CLIENTE</h3>
            <div class="flex items-center gap-4">
              <el-avatar :size="50" class="!bg-blue-600 font-black">{{
                selectedService.customerName.charAt(0).toUpperCase()
              }}</el-avatar>
              <div>
                <p class="font-black text-slate-800 leading-tight">{{ selectedService.customerName }}</p>
                <p class="text-xs font-bold text-slate-400 font-mono tracking-tight">{{ selectedService.document }}</p>
              </div>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 truncate">
              <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Contato</label>
              <span class="text-sm font-bold text-blue-600">{{ selectedService.email }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { Search, Timer, Document, Loading, Printer, Check, ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useServiceStore } from '../store/service.store';

const store = useServiceStore();
const filters = reactive({ search: '', status: 'all', dateRange: null });
const isModalOpen = ref(false);
const selectedService = ref<any>(null);

const shortcuts = [
  { text: 'Hoje', value: () => [new Date(), new Date()] },
  { text: '7 dias', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 7), new Date()] },
  { text: 'Este mês', value: () => [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()] }
];

const getStatusTag = (s: string) => {
  const m: any = {
    in_progress: { label: 'EM ANDAMENTO', type: 'success' },
    waiting: { label: 'AGUARDANDO', type: 'warning' },
    finished: { label: 'CONCLUÍDO', type: 'info' }
  };
  return m[s] || { label: 'N/A', type: 'info' };
};

const getStatusBarColor = (status: string) => {
  if (status === 'in_progress') return 'bg-emerald-500';
  if (status === 'waiting') return 'bg-orange-400';
  if (status === 'finished') return 'bg-slate-400';
  return 'bg-slate-300';
};

const getPriorityColor = (p: string) => p === 'urgent' ? 'bg-red-500' : p === 'high' ? 'bg-orange-400' : 'bg-slate-300';

const openServiceDetails = (s: any) => { selectedService.value = s; isModalOpen.value = true; };

const filteredServices = computed(() => {
  let list = store.services;
  if (filters.status !== 'all') list = list.filter(s => s.status === filters.status);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(s => s.protocol.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q));
  }
  return list;
});

const handleFinishService = () => {
  ElMessageBox.prompt('Descrição da resolução:', 'Finalizar', { confirmButtonText: 'Finalizar', inputType: 'textarea' })
    .then(({ value }) => {
      store.finishService(selectedService.value.id, value);
      isModalOpen.value = false;
      ElMessage.success('Finalizado com sucesso!');
    });
};
const handlePrint = () => window.print();
</script>

<style scoped>
:deep(.custom-input .el-input__wrapper),
:deep(.custom-input .el-select__wrapper) {
  background-color: #f8fafc !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  border: 1px solid #e2e8f0 !important;
}

:deep(.custom-date-picker) {
  background-color: #f8fafc !important;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: none !important;
  padding: 0 8px !important;
}

:deep(.custom-date-picker .el-range-input) {
  font-size: 13px !important;
  background: transparent !important;
  font-weight: 700;
  color: #475569 !important;
}

.animate-spin-slow {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>