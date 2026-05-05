<template>
  <div class="flex-1 overflow-y-auto custom-scroll p-4 lg:p-5">
    <el-collapse v-model="activeCollapses" class="enterprise-collapse border-none gap-4 flex flex-col">
      <el-collapse-item name="routing"
        class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/50 [&_.el-collapse-item\_\_header]:px-4 [&_.el-collapse-item\_\_wrap]:border-none">
        <template #title>
          <div class="font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 text-[11px]">
            <el-icon><Guide /></el-icon> Roteamento & Status
            <div v-if="formErrors.customer || formErrors.priority || formErrors.type"
              class="w-2 h-2 rounded-full bg-red-500 ml-2 animate-pulse"></div>
          </div>
        </template>
        <div class="p-4 space-y-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
        :class="{ 'ring-1 ring-red-500 border-red-500 bg-red-50': formErrors.customer }">
        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
          Cliente / Contato <span v-if="formErrors.customer" class="text-red-500">* Requerido</span>
        </label>
        <el-select v-model="form.customerId" placeholder="Selecione o Cliente" filterable allow-create
          :disabled="isViewing" class="w-full enterprise-select" @change="$emit('update-error', 'customer', false)">
          <template #prefix><el-icon><User /></el-icon></template>
          <el-option v-for="customer in customers" :key="customer.id" 
            :label="getCustomerLabel(customer)" 
            :value="customer.id" />
        </el-select>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
        :class="{'ring-1 ring-red-500 border-red-500 bg-red-50': formErrors.board }">
        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
          Quadro Kanban
          <span v-if="formErrors.board" class="text-red-500">* Obrigatório</span>
        </label>
        <el-select v-model="form.boardId" :disabled="isViewing" class="w-full enterprise-select" @change="$emit('board-change'); $emit('update-error', 'board', false)">
          <template #prefix><el-icon><DataBoard /></el-icon></template>
          <el-option v-for="board in boards" :key="board.id" :label="board.title" :value="board.id" />
        </el-select>
      </div>
      
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
        :class="{'ring-1 ring-red-500 border-red-500 bg-red-50': formErrors.status }">
        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
          Fila / Status
          <span v-if="formErrors.status" class="text-red-500">* Obrigatório</span>
        </label>
        <el-select v-model="form.status" class="w-full enterprise-select" :disabled="(!canApprove && isKanban) || isViewing" @change="$emit('status-change', form.status); $emit('update-error', 'status', false)">
          <template #prefix>
            <div class="w-2 h-2 rounded-full" :class="getStatusColor(form.status)"></div>
          </template>
          <el-option v-for="col in availableColumns" :key="col.id" :label="col.title" :value="col.title">
            <div class="flex items-center gap-2 font-medium">
              <span class="w-2 h-2 rounded-full" :class="col.color?.split(' ')[0] || 'bg-slate-400'"></span>
              {{ col.title }}
            </div>
          </el-option>
        </el-select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
            Prioridade </label>
          <el-select v-model="form.priority" :disabled="isViewing" class="w-full enterprise-select" @change="$emit('update-error', 'priority', false)">
            <el-option label="Baixa" value="low"> <span class="font-medium text-slate-500">Baixa</span></el-option>
            <el-option label="Média" value="medium"> <span class="font-bold text-blue-500">Média</span></el-option>
            <el-option label="Alta" value="high"> <span class="font-bold text-orange-500">Alta</span></el-option>
            <el-option label="Urgente" value="urgent"> <span class="font-black text-red-600">Urgente</span></el-option>
          </el-select>
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
            Categoria </label>
          <el-select v-model="form.type" :disabled="isViewing" class="w-full enterprise-select" @change="$emit('update-error', 'type', false)">
            <el-option label="Suporte" value="support" />
            <el-option label="Bug" value="bug" />
            <el-option label="Melhoria" value="feature" />
            <el-option label="Interno" value="internal" />
          </el-select>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-100">
        <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tempo Estimado (Horas)</label>
        <el-input-number v-model="form.estimatedHours" :disabled="isViewing" :min="0.5" :step="0.5" class="w-full enterprise-input" placeholder="Ex: 2.0" />
      </div>

        </div>
      </el-collapse-item>

      <el-collapse-item name="assignment"
        class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/50 [&_.el-collapse-item\_\_header]:px-4 [&_.el-collapse-item\_\_wrap]:border-none">
        <template #title>
          <span class="font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 text-[11px]">
            <el-icon><Avatar /></el-icon> Equipe
          </span>
        </template>
      <div class="p-4">
        <el-select v-model="form.assignees" multiple filterable placeholder="Atribuir membros..." :disabled="isViewing" class="w-full enterprise-select mb-3">
          <el-option v-for="user in teamMembers" :key="user.id" :label="user.name" :value="user.id">
            <div class="flex items-center gap-2 font-medium">
              <el-avatar :size="20" class="bg-slate-200 text-slate-600 text-[10px]">{{ user.name.charAt(0) }}</el-avatar>
              <span>{{ user.name }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      </el-collapse-item>

      <TicketTagsSelector v-model:selectedTags="form.tags" :readonly="isViewing" class="px-2" />
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Guide, User, DataBoard, Avatar } from '@element-plus/icons-vue';
import TicketTagsSelector from './TicketTagsSelector.vue';

const props = defineProps<{
  form: any;
  formErrors: any;
  customers: any[];
  boards: any[];
  availableColumns: any[];
  teamMembers: any[];
  canApprove: boolean;
  isKanban: boolean;
  isViewing?: boolean;
  getStatusColor: (status: string) => string;
  getCustomerLabel: (customer: any) => string;
}>();

const emit = defineEmits(['update-error', 'board-change', 'status-change']);
const activeCollapses = ref(['routing', 'assignment']);
</script>

<style scoped>
:deep(.enterprise-input .el-input__wrapper),
:deep(.enterprise-select .el-select__wrapper) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background-color: #ffffff !important;
  transition: all 0.2s;
}

:deep(.enterprise-input .el-input__wrapper.is-focus),
:deep(.enterprise-select .el-select__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>
