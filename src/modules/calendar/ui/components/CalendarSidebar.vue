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
              style="color: rgb(51, 126, 204);">Agendas</div>
          </template>

          <div class="px-4 pb-3">
            <el-input v-model="searchQuery" placeholder="Buscar profissional..." :prefix-icon="Search" clearable
              class="modern-search" />
          </div>

          <el-checkbox-group v-model="store.selectedUserIds"
            class="overflow-y-auto custom-scrollbar max-h-[350px] px-2 pb-4 flex flex-col gap-1">
            <el-checkbox v-for="user in filteredUsers" :key="user.id" :label="user.id" :value="user.id"
              class="group flex items-center px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-300 select-none !mr-0 !h-auto w-auto"
              :style="store.selectedUserIds.includes(user.id) ? `background-color: ${user.theme?.light || '#eff6ff'} !important; box-shadow: inset 3px 0 0 ${user.theme?.primary || '#3b82f6'} !important;` : ''"
              :class="!store.selectedUserIds.includes(user.id) ? 'hover:bg-slate-50' : ''">
              <div class="flex items-center gap-3">
                <span class="text-[13px] transition-colors duration-200 truncate font-bold"
                  :style="{ color: store.selectedUserIds.includes(user.id) ? (user.theme?.dark || '#1e40af') : '#475569' }">
                  {{ user.name }}
                </span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useCalendarStore } from '../store/calendar.store';
import { Search, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

const store = useCalendarStore();
const emit = defineEmits(['date-change']);
const activeCollapse = ref(['people']);
const searchQuery = ref('');

onMounted(() => {
  if (store.selectedUserIds.length === 0 && store.availableUsers.length > 0) {
    const firstUserId = store.availableUsers[0]?.id;
    if (firstUserId) store.selectedUserIds = [firstUserId];
  }
});

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

const prevMonth = () => { const d = new Date(miniCalendarDate.value); d.setMonth(d.getMonth() - 1); miniCalendarDate.value = d; };
const nextMonth = () => { const d = new Date(miniCalendarDate.value); d.setMonth(d.getMonth() + 1); miniCalendarDate.value = d; };
</script>

<style scoped>
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

:deep(.el-checkbox__label) {
  padding-left: 8px;
  width: 100%;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>