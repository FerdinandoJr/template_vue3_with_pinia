<template>
  <div
    class="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

    <div class="p-4 shrink-0">
      <div class="bg-slate-50 rounded-xl p-2 border border-slate-100 transition-all hover:shadow-sm">

        <div class="flex items-center justify-between mb-1 px-1">
          <el-button :icon="ArrowLeft" circle text size="small" @click="prevMonth" class="!p-1 hover:bg-slate-200/50"
            style="color: rgb(51, 126, 204);" />

          <div class="relative flex justify-center items-center flex-1">
            <span class="absolute font-extrabold text-[13px] capitalize pointer-events-none z-0"
              style="color: rgb(51, 126, 204);">
              {{ formattedMonthYear }}
            </span>

            <el-date-picker v-model="miniCalendarDate" type="month" :clearable="false"
              class="hidden-date-picker z-10" />
          </div>

          <el-button :icon="ArrowRight" circle text size="small" @click="nextMonth" class="!p-1 hover:bg-slate-200/50"
            style="color: rgb(51, 126, 204);" />
        </div>

        <el-calendar v-model="miniCalendarDate" class="mini-calendar" />
      </div>
    </div>

    <div class="flex-1 flex flex-col min-h-0 border-t border-slate-100">

      <el-collapse v-model="activeCollapse" class="modern-collapse border-none">
        <el-collapse-item name="people">
          <template #title>
            <div class="flex items-center text-[12px] font-bold px-5 tracking-wide uppercase w-full"
              style="color: rgb(51, 126, 204);">
              Adicionar Pessoa
            </div>
          </template>

          <div class="px-4 pb-3">
            <el-input v-model="searchQuery" placeholder="Buscar membro..." :prefix-icon="Search" clearable
              class="modern-search" />
          </div>

          <div class="overflow-y-auto custom-scrollbar max-h-[350px] px-2 pb-4">
            <div v-for="user in filteredUsers" :key="user.id" @click="store.toggleUserFilter(user.id)"
              class="group flex items-center gap-3 px-3 py-1.5 mx-2 rounded-md cursor-pointer transition-all duration-200 select-none"
              :class="store.selectedUserIds.includes(user.id)
                ? 'bg-indigo-50 shadow-[inset_2px_0_0_#4f46e5]'
                : 'hover:bg-slate-50'">
              <el-checkbox :model-value="store.selectedUserIds.includes(user.id)"
                class="!mr-0 pointer-events-none custom-checkbox" />

              <span class="text-[13px] transition-colors duration-200 truncate"
                :class="store.selectedUserIds.includes(user.id) ? 'text-indigo-700 font-semibold' : 'text-slate-600 group-hover:text-slate-900'">
                {{ user.name }}
              </span>
            </div>

            <div v-if="filteredUsers.length === 0" class="text-center py-4">
              <span class="text-[11px] text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full">
                Nenhum membro encontrado
              </span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAgendaStore } from '../store/agenda.store';
import { Search, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

const store = useAgendaStore();
const emit = defineEmits(['date-change']);

const activeCollapse = ref(['people']);
const searchQuery = ref('');

const filteredUsers = computed(() => {
  if (!searchQuery.value) return store.availableUsers;
  const query = searchQuery.value.toLowerCase();
  return store.availableUsers.filter(u => u.name.toLowerCase().includes(query));
});

const miniCalendarDate = computed({
  get: () => store.selectedDate,
  set: (val) => {
    if (!val) return;
    store.setSelectedDate(val);
    emit('date-change', val);
  }
});

const formattedMonthYear = computed(() => {
  const d = miniCalendarDate.value;
  return d ? d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) : '';
});

const prevMonth = () => {
  const d = new Date(miniCalendarDate.value);
  d.setMonth(d.getMonth() - 1);
  miniCalendarDate.value = d;
};

const nextMonth = () => {
  const d = new Date(miniCalendarDate.value);
  d.setMonth(d.getMonth() + 1);
  miniCalendarDate.value = d;
};
</script>

<style scoped>
/* Reduzindo o vazamento (acoplamento global) definindo como SCOPED e usando variáveis nativas */
.hidden-date-picker {
  width: 100%;
  max-width: 140px;
}

:deep(.hidden-date-picker .el-input__wrapper) {
  box-shadow: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

:deep(.hidden-date-picker .el-input__inner) {
  color: transparent;
  cursor: pointer;
}

:deep(.hidden-date-picker .el-input__prefix) {
  display: none;
}

/* Modificadores isolados com :deep */
:deep(.mini-calendar .el-calendar__header) {
  display: none;
}

:deep(.mini-calendar .el-calendar__body) {
  padding: 0;
}

:deep(.mini-calendar .el-calendar-table td) {
  border: none;
  padding: 2px;
}

:deep(.mini-calendar .el-calendar-table .el-calendar-day) {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 12px;
  transition: all 0.2s;
}

:deep(.mini-calendar .el-calendar-table td.is-selected .el-calendar-day) {
  background-color: rgb(51, 126, 204);
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(51, 126, 204, 0.3);
}

:deep(.mini-calendar .el-calendar-table td.is-today .el-calendar-day) {
  color: rgb(51, 126, 204);
  font-weight: 900;
  background-color: #f0f5ff;
}

:deep(.mini-calendar .el-calendar-table td .el-calendar-day:hover) {
  background-color: #f1f5f9;
}

/* Accordion e Busca isolados no componente */
:deep(.modern-collapse .el-collapse-item__header) {
  border-bottom: none;
  background: transparent;
  height: 48px;
}

:deep(.modern-collapse .el-collapse-item__wrap) {
  border-bottom: none;
  background: transparent;
}

:deep(.modern-search .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  border-radius: 8px;
  background: #f8fafc;
  padding: 2px 10px;
}

:deep(.modern-search .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #4f46e5 inset;
  background: #fff;
}

:deep(.custom-checkbox .el-checkbox__inner) {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border-color: #cbd5e1;
}

:deep(.custom-checkbox.is-checked .el-checkbox__inner) {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>