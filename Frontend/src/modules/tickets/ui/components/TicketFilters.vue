<template>
  <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">

    <div class="flex flex-wrap items-center gap-4">

      <div class="relative flex-1 min-w-[280px]">
        <el-input v-model="localFilters.query" placeholder="Buscar por ID, Título, Descrição..."
          class="w-full enterprise-search" size="large" clearable @input="onInputQuery">
          <template #prefix>
            <el-icon class="text-slate-400">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="w-full sm:w-auto">
        <el-date-picker v-model="localFilters.dateRange" type="daterange" unlink-panels range-separator="até"
          start-placeholder="Data Inicial" end-placeholder="Data Final" format="DD/MM/YYYY" :shortcuts="dateShortcuts"
          class="w-full" size="large" @change="onChangeFilter" />
      </div>

      <el-button size="large" :type="mostrarFiltrosAvancados ? 'primary' : 'default'"
        @click="mostrarFiltrosAvancados = !mostrarFiltrosAvancados"
        class="flex-shrink-0 transition-all duration-300 !font-bold">
        <el-icon class="mr-2">
          <Filter />
        </el-icon>
        Filtros Avançados
        <span v-if="quantidadeFiltrosAtivos > 0"
          class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">
          {{ quantidadeFiltrosAtivos }}
        </span>
      </el-button>

      <el-button size="large" @click="clearFilters" :disabled="!hasActiveFilters"
        :class="['transition-colors !font-bold ml-auto', hasActiveFilters ? '!bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-100' : '']">
        <el-icon class="mr-1">
          <Close />
        </el-icon>
        Limpar
      </el-button>
    </div>

    <el-collapse-transition>
      <div v-show="mostrarFiltrosAvancados" class="p-5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <div class="flex flex-col justify-center">
            <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Exibição</label>
            <div
              class="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm h-[40px]">
              <span class="text-[13px] font-bold"
                :class="localFilters.ownerOnly ? 'text-blue-600' : 'text-slate-600'">Apenas Meus Tickets</span>
              <el-switch v-model="localFilters.ownerOnly" @change="onChangeFilter" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Status</label>
            <el-select v-model="localFilters.status" placeholder="Todos os Status" class="w-full enterprise-select"
              size="large" @change="onChangeFilter">
              <el-option label="Todos" value="all" />
              <el-option label="Abertos" value="open" />
              <el-option label="Triagem" value="pending_approval" />
              <el-option label="Aguardando" value="in-progress" />
              <el-option label="Resolvidos" value="resolved" />
              <el-option label="Internos" value="internal" />
            </el-select>
          </div>

          <div>
            <label
              class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Responsável</label>
            <el-select v-model="localFilters.assignees" multiple collapse-tags collapse-tags-tooltip filterable
              placeholder="Qualquer" class="w-full enterprise-select" size="large" @change="onChangeFilter"
              :disabled="localFilters.ownerOnly">
              <template #prefix><el-icon>
                  <User />
                </el-icon></template>
              <el-option label="Admin (Você)" value="1" />
              <el-option label="João Atendimento" value="2" />
              <el-option label="Maria Vendas" value="3" />
            </el-select>
          </div>

          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Cliente</label>
            <el-select v-model="localFilters.customers" multiple collapse-tags collapse-tags-tooltip filterable
              placeholder="Qualquer" class="w-full enterprise-select" size="large" @change="onChangeFilter">
              <template #prefix><el-icon>
                  <Briefcase />
                </el-icon></template>
              <el-option label="João Silva" value="João Silva" />
              <el-option label="Maria Santos" value="Maria Santos" />
              <el-option label="Pedro Costa" value="Pedro Costa" />
              <el-option label="Ana Oliveira" value="Ana Oliveira" />
              <el-option label="Carlos Mendes" value="Carlos Mendes" />
              <el-option label="Julia Ferreira" value="Julia Ferreira" />
            </el-select>
          </div>

        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, Briefcase, User, Close, Filter } from '@element-plus/icons-vue';
import type { TicketFilter } from '../../data/ticket.services';

const props = defineProps<{
  filters: TicketFilter
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: TicketFilter): void
}>();

const getDefaultDateRange = (): [Date, Date] => {
  const date = new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [start, end];
};

const localFilters = ref<TicketFilter>({
  query: props.filters.query || '',
  status: props.filters.status || 'all',
  customers: props.filters.customers || [],
  assignees: props.filters.assignees || [],
  ownerOnly: props.filters.ownerOnly ?? true,
  dateRange: props.filters.dateRange && props.filters.dateRange.length === 2
    ? props.filters.dateRange
    : getDefaultDateRange()
});

const mostrarFiltrosAvancados = ref(false);

const quantidadeFiltrosAtivos = computed(() => {
  let count = 0;
  if (localFilters.value.status && localFilters.value.status !== 'all') count++;
  if (localFilters.value.ownerOnly) count++;
  if (localFilters.value.assignees && localFilters.value.assignees.length > 0) count++;
  if (localFilters.value.customers && localFilters.value.customers.length > 0) count++;
  return count;
});

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

const hasActiveFilters = computed(() => {
  const cDates = localFilters.value.dateRange;
  const dDates = getDefaultDateRange();

  const isDateChanged = !cDates || cDates.length !== 2 ||
    cDates[0].getTime() !== dDates[0].getTime() ||
    cDates[1].getTime() !== dDates[1].getTime();

  return localFilters.value.query !== '' ||
    localFilters.value.status !== 'all' ||
    localFilters.value.ownerOnly === false ||
    (localFilters.value.assignees && localFilters.value.assignees.length > 0) ||
    (localFilters.value.customers && localFilters.value.customers.length > 0) ||
    isDateChanged;
});

const dateShortcuts = [
  {
    text: 'Hoje',
    value: () => {
      const end = new Date();
      const start = new Date();
      return [start, end];
    },
  },
  {
    text: 'Últimos 7 dias',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: 'Últimos 30 dias',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: 'Este Mês',
    value: getDefaultDateRange,
  },
];

let timeout: any;
const onInputQuery = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    emit('update:filters', { ...localFilters.value });
  }, 500);
};

const onChangeFilter = () => {
  emit('update:filters', { ...localFilters.value });
};

const clearFilters = () => {
  localFilters.value = {
    query: '',
    status: 'all',
    customers: [],
    assignees: [],
    ownerOnly: true,
    dateRange: getDefaultDateRange()
  };
  emit('update:filters', { ...localFilters.value });
};
</script>

<style scoped>
:deep(.enterprise-search .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px #e2e8f0 inset;
  background-color: #f8fafc;
}

:deep(.enterprise-search .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #3b82f6 inset;
  background-color: #ffffff;
}

:deep(.enterprise-select .el-select__wrapper) {
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #e2e8f0 !important;
}

:deep(.enterprise-select .el-select__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
}
</style>