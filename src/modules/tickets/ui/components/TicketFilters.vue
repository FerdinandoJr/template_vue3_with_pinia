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

      <el-radio-group v-model="localFilters.status" size="large" @change="onChangeFilter"
        class="shrink-0 w-full xl:w-auto overflow-x-auto">
        <el-radio-button value="all">Todos os Tickets</el-radio-button>
        <el-radio-button value="open">Abertos</el-radio-button>
        <el-radio-button value="in-progress">Em Andamento</el-radio-button>
        <el-radio-button value="resolved">Resolvidos</el-radio-button>
      </el-radio-group>
    </div>

    <div class="flex flex-col md:flex-row gap-4 items-center bg-slate-50/70 p-3 rounded-xl border border-slate-100">

      <el-select v-model="localFilters.customers" multiple collapse-tags collapse-tags-tooltip filterable
        placeholder="Filtrar por Clientes" class="w-full md:w-72" @change="onChangeFilter">
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

      <el-date-picker v-model="localFilters.dateRange" type="daterange" unlink-panels range-separator="até"
        start-placeholder="Data Inicial" end-placeholder="Data Final" format="DD/MM/YYYY" :shortcuts="dateShortcuts"
        class="w-full md:w-80" @change="onChangeFilter" />

      <el-button v-if="hasActiveFilters" @click="clearFilters" text
        class="md:ml-auto text-slate-500 hover:text-red-500 transition-colors w-full md:w-auto font-bold">
        Limpar Filtros
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, Briefcase } from '@element-plus/icons-vue';
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
  dateRange: props.filters.dateRange && props.filters.dateRange.length === 2
    ? props.filters.dateRange
    : getDefaultDateRange()
});

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

const hasActiveFilters = computed(() => {
  return localFilters.value.query !== '' ||
    localFilters.value.status !== 'all' ||
    (localFilters.value.customers && localFilters.value.customers.length > 0);
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