<template>
  <div class="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
    <div class="p-6 shrink-0">
      <div class="bg-slate-50 rounded-[20px] p-4 border border-slate-100 transition-all hover:shadow-sm">
        <div class="flex items-center justify-between mb-4">
           <el-button :icon="ArrowLeft" circle text size="small" @click="prevMonth" class="hover:bg-white" />
           <span class="font-black text-[13px] text-slate-700 capitalize">{{ formattedMonthYear }}</span>
           <el-button :icon="ArrowRight" circle text size="small" @click="nextMonth" class="hover:bg-white" />
        </div>
        <el-calendar v-model="miniCalendarDate" class="premium-mini-calendar" />
      </div>
    </div>

    <div class="flex-1 flex flex-col min-h-0 border-t border-slate-50">
       <div class="px-6 py-5 flex items-center justify-between shrink-0">
          <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Filtrar Profissionais</h3>
          <el-icon class="text-slate-300"><User /></el-icon>
       </div>

       <div class="px-6 pb-4 shrink-0">
          <el-input v-model="searchQuery" placeholder="Buscar..." :prefix-icon="Search" class="premium-search-input" clearable />
       </div>

       <div class="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar">
          <div v-for="user in filteredUsers" :key="user.id" 
            @click="toggleUser(user.id)"
            class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent"
            :class="store.selectedUserIds.includes(user.id) ? 'bg-blue-50/50 border-blue-100' : 'hover:bg-slate-50'">
            
            <div class="relative">
               <el-avatar :size="32" :src="user.avatar" class="bg-slate-200 text-slate-400 border border-white shadow-sm font-black text-[10px]">
                  {{ user.name.charAt(0) }}
               </el-avatar>
               <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" :style="{ backgroundColor: user.theme?.primary || '#3b82f6' }"></div>
            </div>
            
            <span class="text-[13px] font-bold truncate flex-1" :class="store.selectedUserIds.includes(user.id) ? 'text-blue-700' : 'text-slate-600'">
               {{ user.name }}
            </span>

            <el-checkbox :model-value="store.selectedUserIds.includes(user.id)" class="pointer-events-none" />
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCalendarStore } from '../store/calendar.store';
import { Search, ArrowLeft, ArrowRight, User } from '@element-plus/icons-vue';

const store = useCalendarStore();
const searchQuery = ref('');

const filteredUsers = computed(() => {
  if (!searchQuery.value) return store.availableUsers;
  const q = searchQuery.value.toLowerCase();
  return store.availableUsers.filter(u => u.name.toLowerCase().includes(q));
});

const toggleUser = (id: string) => {
  const index = store.selectedUserIds.indexOf(id);
  if (index > -1) store.selectedUserIds.splice(index, 1);
  else store.selectedUserIds.push(id);
};

const miniCalendarDate = computed({
  get: () => store.selectedDate,
  set: (val) => { if (val) store.setSelectedDate(val); }
});

const formattedMonthYear = computed(() => store.selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }));
const prevMonth = () => { const d = new Date(store.selectedDate); d.setMonth(d.getMonth() - 1); store.setSelectedDate(d); };
const nextMonth = () => { const d = new Date(store.selectedDate); d.setMonth(d.getMonth() + 1); store.setSelectedDate(d); };
</script>

<style scoped>
:deep(.premium-mini-calendar .el-calendar__header) { display: none; }
:deep(.premium-mini-calendar .el-calendar__body) { padding: 0; }
:deep(.premium-mini-calendar .el-calendar-table td) { border: none !important; padding: 1px !important; }
:deep(.premium-mini-calendar .el-calendar-table .el-calendar-day) { height: 30px !important; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 11px; font-weight: 700; transition: all 0.2s; }
:deep(.premium-mini-calendar .el-calendar-table td.is-selected .el-calendar-day) { background-color: #3b82f6 !important; color: white !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); }
:deep(.premium-mini-calendar .el-calendar-table td.is-today .el-calendar-day) { color: #3b82f6; background-color: #eff6ff; }
</style>