<template>
  <div class="flex flex-col h-[calc(100vh-5rem)] bg-slate-50/50 p-6 print-container">

    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 shrink-0 no-print">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight mb-6">Gestão de Atendimentos</h1>

      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
            Buscar Chamado
          </label>
          <el-input v-model="filters.search" @input="handleSearch" placeholder="Protocolo, cliente..." clearable
            :prefix-icon="Search" size="large" class="custom-input" />
        </div>

        <div class="w-48">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Status</label>
          <el-select v-model="filters.status" @change="handleFilterChange" size="large" class="w-full custom-input">
            <el-option label="Todos" value="all" />
            <el-option label="Em Andamento" value="in_progress" />
            <el-option label="Aguardando" value="waiting" />
            <el-option label="Concluídos" value="finished" />
          </el-select>
        </div>

        <div class="w-80">
          <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
            Período de Abertura
          </label>
          <el-date-picker v-model="filters.dateRange" type="daterange" unlink-panels range-separator="até"
            start-placeholder="Início" end-placeholder="Fim" :shortcuts="shortcuts" format="DD/MM/YY"
            value-format="DD/MM/YYYY" size="large" class="!w-full custom-date-picker" />
        </div>

        <el-button :icon="Refresh" @click="resetFilters" size="large" class="!rounded-xl font-bold">
          Limpar
        </el-button>
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

      <div v-if="store.loading && store.services.length === 0" class="flex justify-center p-10 flex-1 items-center">
        <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      <ul v-else class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        <li v-for="service in store.services" :key="service.id" @click="openServiceDetails(service)"
          class="grid grid-cols-12 gap-4 items-center px-4 py-4 bg-white border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md rounded-xl cursor-pointer transition-all group">

          <div class="col-span-2 flex items-center gap-3">
            <div class="w-1.5 h-10 rounded-full" :class="getStatusBarColor(service.status)"></div>
            <span class="font-mono text-sm font-black text-slate-600 group-hover:text-blue-600 tracking-tight">
              #{{ service.protocol }}
            </span>
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

        <div v-if="!store.loading && store.services.length === 0" class="py-12 text-center text-slate-500">
          <el-icon :size="40" class="mb-2 block mx-auto">
            <Document />
          </el-icon>
          <p>Nenhum atendimento encontrado.</p>
        </div>
      </ul>

      <div
        class="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">
          Página {{ store.currentPage }} de {{ Math.ceil(store.filteredTotal / store.pageSize) || 1 }}
        </span>

        <el-pagination :current-page="store.currentPage" :page-size="store.pageSize" :page-sizes="[10, 20, 50, 100]"
          :total="store.filteredTotal" layout="sizes, prev, pager, next" background @size-change="store.setPageSize"
          @current-change="store.setPage" />
      </div>
    </div>

    <el-dialog v-model="isModalOpen" width="1000px" top="5vh" class="!rounded-[24px] overflow-hidden"
      :show-close="false">
      <template #header>
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-4">
            <el-button circle @click="isModalOpen = false" class="!border-none !bg-slate-100 hover:!bg-slate-200">
              <el-icon>
                <ArrowLeft />
              </el-icon>
            </el-button>
            <div v-if="selectedService">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Detalhes do Atendimento
              </span>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-black text-slate-800 font-mono tracking-tighter">
                  #{{ selectedService.protocol }}
                </h2>
                <el-tag :type="getStatusTag(selectedService.status).type" effect="dark"
                  class="!font-black !border-none px-4 !rounded-lg">
                  {{ getStatusTag(selectedService.status).label }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <el-button type="info" plain :icon="Printer" @click="handlePrint"
              class="!rounded-xl font-bold">Imprimir</el-button>
            <el-button type="success" :icon="Check" v-if="selectedService?.status !== 'finished'"
              @click="handleFinishService" class="!rounded-xl !font-black !bg-emerald-500 px-8">
              FINALIZAR
            </el-button>
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
                    <span class="text-[10px] font-black px-2 py-1 rounded bg-slate-100 text-slate-500 uppercase">
                      {{ event.author }}
                    </span>
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
              <el-avatar :size="50" class="!bg-blue-600 font-black">
                {{ selectedService.customerName?.charAt(0).toUpperCase() }}
              </el-avatar>
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
import { ref, reactive, onMounted } from 'vue';
import { Search, Timer, Document, Printer, Check, ArrowLeft, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useServiceStore } from '../store/service.store';

const store = useServiceStore();

const filters = reactive({
  search: '',
  status: 'all',
  dateRange: null as [string, string] | null
});

const isModalOpen = ref(false);
const selectedService = ref<any>(null);

let searchTimeout: any = null;

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.setFilter({ query: filters.search });
  }, 300);
};

const handleFilterChange = () => {
  store.setFilter({ status: filters.status });
};

const resetFilters = () => {
  filters.search = '';
  filters.status = 'all';
  filters.dateRange = null;
  store.setFilter({ query: '', status: 'all' });
  ElMessage.success('Filtros limpos');
};

const shortcuts = [
  { text: 'Hoje', value: () => [new Date(), new Date()] },
  { text: '7 dias', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 7), new Date()] },
  { text: 'Este mês', value: () => [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()] }
];

const getStatusTag = (s: string) => {
  const m: any = {
    in_progress: { label: 'EM ANDAMENTO', type: 'success' },
    waiting: { label: 'AGUARDANDO', type: 'warning' },
    finished: { label: 'CONCLUÍDO', type: 'info' },
    paused: { label: 'PAUSADO', type: 'warning' }
  };
  return m[s] || { label: 'N/A', type: 'info' };
};

const getStatusBarColor = (status: string) => {
  if (status === 'in_progress') return 'bg-emerald-500';
  if (status === 'waiting') return 'bg-orange-400';
  if (status === 'finished') return 'bg-slate-400';
  if (status === 'paused') return 'bg-amber-400';
  return 'bg-slate-300';
};

const openServiceDetails = (s: any) => {
  selectedService.value = s;
  isModalOpen.value = true;
};

const handleFinishService = () => {
  if (!selectedService.value) return;

  ElMessageBox.prompt('Descrição da resolução:', 'Finalizar Atendimento', {
    confirmButtonText: 'Finalizar',
    cancelButtonText: 'Cancelar',
    inputType: 'textarea'
  }).then(({ value }) => {
    store.finishService(selectedService.value.id, value);
    isModalOpen.value = false;
    ElMessage.success('Atendimento finalizado com sucesso!');
  }).catch(() => { });
};

const handlePrint = () => window.print();

onMounted(() => {
  store.fetchServices();
});
</script>

<style scoped>
/* Estilos originais preservados */
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

@media print {
  .no-print {
    display: none !important;
  }

  .print-container {
    padding: 0 !important;
    background: white !important;
  }
}
</style>