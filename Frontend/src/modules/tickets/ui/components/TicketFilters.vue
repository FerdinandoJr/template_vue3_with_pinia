<template>
  <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-3 flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[280px]">
        <el-input v-model="localFilters.query" placeholder="Buscar por ID, Título, Descrição..."
          class="w-full enterprise-search" size="default" clearable @input="onInputQuery">
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
          class="w-full" size="default" @change="onChangeFilter" />
      </div>

      <el-button size="default" :type="mostrarFiltrosAvancados ? 'primary' : 'default'" @click="onToggleAdvanced"
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

      <el-button size="default" @click="clearFilters" :disabled="!hasActiveFilters"
        :class="['transition-colors !font-bold ml-auto', hasActiveFilters ? '!bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-100' : '']">
        <el-icon class="mr-1">
          <Close />
        </el-icon>
        Limpar
      </el-button>
    </div>

    <el-collapse-transition>
      <div v-show="mostrarFiltrosAvancados" class="p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm mt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          <div class="flex flex-col justify-center">
            <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Exibição</label>
            <div
              class="flex items-center justify-between bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm h-[32px]">
              <span class="text-[13px] font-bold"
                :class="localFilters.ownerOnly ? 'text-blue-600' : 'text-slate-600'">Apenas Meus Tickets</span>
              <el-switch v-model="localFilters.ownerOnly" active-color="#3b82f6" @change="onChangeFilter" />
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</label>
            <el-select v-model="localFilters.status" placeholder="Todos os Status" class="w-full enterprise-select"
              size="default" @change="onChangeFilter" :teleported="false" placement="bottom-start">
              <el-option label="Todos" value="all" />
              <el-option label="Abertos" value="open" />
              <el-option label="Aguardando" value="in_progress" />
              <el-option label="Resolvidos" value="resolved" />
              <el-option label="Fechados" value="closed" />
            </el-select>
          </div>

          <div>
            <label
              class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Responsável</label>
            <el-select v-model="localFilters.assignees" multiple collapse-tags collapse-tags-tooltip filterable
              placeholder="Qualquer" class="w-full enterprise-select" size="default" @change="onChangeFilter"
              :teleported="false" placement="bottom-start">
              <template #prefix>
                <el-icon>
                  <User />
                </el-icon>
              </template>
              <el-option v-for="user in usersOptions" :key="user.id" :label="user.name" :value="user.id" />
            </el-select>
          </div>

          <div>
            <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Cliente</label>
            <el-select v-model="localFilters.customers" multiple collapse-tags collapse-tags-tooltip filterable remote
              reserve-keyword :remote-method="remoteSearchCustomers" :loading="loadingCustomers" placeholder="Todos"
              class="w-full enterprise-select" size="default" @focus="onFocusCustomers" @change="onChangeFilter"
              :teleported="false" placement="bottom-start" :fit-input-width="true">
              <template #prefix>
                <el-icon>
                  <Briefcase />
                </el-icon>
              </template>
              <el-option v-for="customer in customersOptions" :key="customer.id" :label="customer.name"
                :value="customer.id" />
            </el-select>
          </div>

        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Search, Briefcase, User, Close, Filter } from '@element-plus/icons-vue';
import type { TicketFilter } from '../../data/ticket.services';
import { ticketServices } from '../../data/ticket.services';
import { httpClient } from '@/core/infra/HttpClient';
import { formatCustomerNameFromList } from '@/utils/customer';

const props = defineProps<{ filters: TicketFilter }>();
const emit = defineEmits<{ (e: 'update:filters', filters: TicketFilter): void }>();

const usersOptions = ref<{ id: string; name: string }[]>([]);
const customersOptions = ref<{ id: string; name: string }[]>([]);
const optionsLoaded = ref(false);
const loadingCustomers = ref(false);
const customersLoaded = ref(false);

const loadOptions = async () => {
  if (optionsLoaded.value) return;
  try {
    const options = await ticketServices.getOptions();
    usersOptions.value = options.users;
    customersOptions.value = options.customers;
    optionsLoaded.value = true;
    customersLoaded.value = true;
  } catch (e) {
    console.error('[TicketFilters] Erro ao carregar opções:', e);
  }
};

const loadCustomersOnly = async () => {
  if (customersLoaded.value) return;
  try {
    const res = await httpClient.get<any>('/customers');
    const data = res.data?.data || res.data || [];
    const list = Array.isArray(data) ? data : (data.items || []);
    customersOptions.value = list.map((c: any) => ({
      id: String(c.id),
      name: formatCustomerNameFromList(c)
    }));
    customersLoaded.value = true;
  } catch (e) {
    console.error('[TicketFilters] Erro ao buscar clientes:', e);
  }
};

const remoteSearchCustomers = async (query: string) => {
  if (query && query.length >= 3) {
    loadingCustomers.value = true;
    try {
      const res = await httpClient.get<any>(`/customers?q=${encodeURIComponent(query)}`);
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : (data.items || []);

      customersOptions.value = list.map((c: any) => ({
        id: String(c.id),
        name: formatCustomerNameFromList(c)
      }));
    } catch (e) {
      console.error('[TicketFilters] Erro ao buscar clientes:', e);
    } finally {
      loadingCustomers.value = false;
    }
  } else if (!query || query.length < 3) {
    loadCustomersOnly();
  }
};

const onFocusCustomers = () => {
  if (customersOptions.value.length === 0 || !customersLoaded.value) {
    loadCustomersOnly();
  }
};

const onToggleAdvanced = () => {
  mostrarFiltrosAvancados.value = !mostrarFiltrosAvancados.value;
  if (mostrarFiltrosAvancados.value) {
    loadOptions();
  }
};

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
  if (newVal) {
    localFilters.value = { 
      ...newVal,
      query: newVal.query || '',
      status: newVal.status || 'all',
      customers: newVal.customers || [],
      assignees: newVal.assignees || [],
      ownerOnly: newVal.ownerOnly ?? true,
      dateRange: newVal.dateRange || localFilters.value.dateRange
    };
  }
}, { deep: true, immediate: true });

const hasActiveFilters = computed(() => {
  const cDates = localFilters.value.dateRange;
  const dDates = getDefaultDateRange();
  const isDateChanged = !cDates || cDates.length !== 2 ||
    cDates[0].getTime() !== dDates[0].getTime() ||
    cDates[1].getTime() !== dDates[1].getTime();

  return localFilters.value.query !== '' ||
    localFilters.value.status !== 'all' ||
    localFilters.value.ownerOnly === true ||
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