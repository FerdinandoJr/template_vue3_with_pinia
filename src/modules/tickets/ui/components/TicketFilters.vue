<template>
  <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">

    <div class="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

      <div class="relative w-full xl:max-w-md">
        <el-input v-model="localFilters.query" placeholder="Buscar por ID, Título, Descrição..."
          class="w-full enterprise-search" size="large" clearable @input="onInputQuery">
          <template #prefix>
            <el-icon class="text-slate-400">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto overflow-x-auto pb-1 px-1">
        <div
          class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 shadow-sm">
          <span class="text-sm font-bold" :class="localFilters.ownerOnly ? 'text-blue-600' : 'text-slate-500'">Meus
            Tickets</span>
          <el-switch v-model="localFilters.ownerOnly" @change="onChangeFilter" class="ml-1" />
        </div>

        <el-radio-group v-model="localFilters.status" size="large" @change="onChangeFilter" class="shrink-0 shadow-sm">
          <el-radio-button value="all">Todos</el-radio-button>
          <el-radio-button value="open">Abertos</el-radio-button>
          <el-radio-button value="pending_approval">Triagem</el-radio-button>
          <el-radio-button value="in-progress">Aguardando</el-radio-button>
          <el-radio-button value="resolved">Resolvidos</el-radio-button>
          <el-radio-button value="internal">Internos</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 items-center bg-slate-50/70 p-4 rounded-xl border border-slate-100">

      <div class="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[240px]">
        <el-select v-model="localFilters.assignees" multiple collapse-tags collapse-tags-tooltip filterable
          placeholder="Responsável" class="w-full" @change="onChangeFilter" :disabled="localFilters.ownerOnly">
          <template #prefix>
            <el-icon>
              <User />
            </el-icon>
          </template>
          <!-- Mock options since there's no real users endpoint -->
          <el-option label="Admin (Você)" value="1" />
          <el-option label="João Atendimento" value="2" />
          <el-option label="Maria Vendas" value="3" />
        </el-select>
      </div>

      <div class="w-full sm:flex-1 sm:min-w-[250px]">
        <el-select v-model="localFilters.customers" multiple collapse-tags collapse-tags-tooltip filterable
          placeholder="Filtrar por Clientes" class="w-full" @change="onChangeFilter">
          <template #prefix>
            <el-icon>
              <Briefcase />
            </el-icon>
          </template>
          <el-option label="João Silva" value="João Silva" />
          <el-option label="Maria Santos" value="Maria Santos" />
          <el-option label="Pedro Costa" value="Pedro Costa" />
          <el-option label="Ana Oliveira" value="Ana Oliveira" />
          <el-option label="Carlos Mendes" value="Carlos Mendes" />
          <el-option label="Julia Ferreira" value="Julia Ferreira" />
        </el-select>
      </div>

      <div class="w-full sm:w-auto sm:min-w-[340px]">
        <el-date-picker v-model="localFilters.dateRange" type="daterange" unlink-panels range-separator="até"
          start-placeholder="Data Inicial" end-placeholder="Data Final" format="DD/MM/YYYY" :shortcuts="dateShortcuts"
          class="w-full" @change="onChangeFilter" />
      </div>

      <div class="w-full sm:w-auto ml-auto flex justify-end">
        <el-button @click="clearFilters" :disabled="!hasActiveFilters"
          :class="['transition-colors !font-bold', hasActiveFilters ? '!bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-100' : '']">
          <el-icon class="mr-1">
            <Close />
          </el-icon>
          Limpar Filtros
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, Briefcase, User, Close } from '@element-plus/icons-vue';
import type { TicketFilter } from '../../data/ticket.services';

const props = defineProps<{ filters: TicketFilter }>();
const emit = defineEmits<{ (e: 'update:filters', filters: TicketFilter): void }>();

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
</style>