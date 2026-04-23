<template>
  <el-dialog 
    :model-value="isOpen" 
    width="90%" 
    style="max-width: 800px; border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);"
    top="8vh"
    append-to-body
    @close="handleClose" 
    destroy-on-close 
    :close-on-click-modal="false"
    class="saas-enterprise-modal"
  >
    <div class="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between z-10 relative">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white"
             :class="form.isBlocker ? 'bg-slate-700' : 'bg-blue-600'">
          <el-icon class="text-xl">
            <component :is="form.isBlocker ? 'Lock' : (isEditing ? 'EditPen' : 'Calendar')" />
          </el-icon>
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 leading-tight">
            {{ isEditing ? 'Editar Registro' : 'Novo Agendamento' }}
          </h2>
          <p class="text-xs font-medium text-slate-500 mt-0.5">
            {{ form.isBlocker ? 'Gerenciamento de Indisponibilidade' : 'Agendamento e Atendimento' }}
          </p>
        </div>
      </div>
      
      <div class="bg-slate-100 p-1 rounded-lg flex items-center shadow-inner">
        <button type="button" @click="form.isBlocker = false" 
          class="px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2"
          :class="!form.isBlocker ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-300 cursor-not-allowed'"
          :disabled="form.isBlocker">
          <el-icon><Checked /></el-icon> Evento
        </button>
        <button type="button" @click="form.isBlocker = true" 
          class="px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2"
          :class="form.isBlocker ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          <el-icon><Lock /></el-icon> Bloqueio
        </button>
      </div>
    </div>

    <el-form ref="ruleFormRef" :model="form" :rules="rules" label-position="top" class="flex bg-white w-full" style="height: 580px; max-height: calc(100vh - 20vh);">
      
      <div class="w-48 shrink-0 border-r border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-1">
        <button type="button" @click="activeTab = 'general'" class="saas-tab-btn" :class="{ 'active': activeTab === 'general', 'disabled': form.isBlocker }" :disabled="form.isBlocker">
          <el-icon><InfoFilled /></el-icon> Informações
        </button>
        <button type="button" @click="activeTab = 'details'" class="saas-tab-btn" :class="{ 'active': activeTab === 'details', 'disabled': form.isBlocker }" :disabled="form.isBlocker">
          <el-icon><Location /></el-icon> Local e Pauta
        </button>
        <button type="button" @click="activeTab = 'recurrence'" class="saas-tab-btn" :class="{ 'active': activeTab === 'recurrence', 'disabled': form.isBlocker }" :disabled="form.isBlocker">
          <el-icon><Refresh /></el-icon> Recorrência
        </button>
        <button v-if="!form.isBlocker" type="button" @click="activeTab = 'postMeeting'" class="saas-tab-btn" :class="{ 'active': activeTab === 'postMeeting' }">
          <el-icon><DocumentChecked /></el-icon> Atas (Pós)
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 saas-scroll">
        
        <div v-show="activeTab === 'general'" class="animate-fade-in pt-2">
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-0">
            <el-form-item :label="form.isBlocker ? 'Motivo do Bloqueio *' : 'Título do Evento *'" prop="title" class="md:col-span-3 saas-input-group">
              <el-input v-model="form.title" placeholder="Ex: Reunião de Alinhamento" />
            </el-form-item>

            <el-form-item v-if="!form.isBlocker" label="Cor" class="md:col-span-1 saas-input-group">
              <el-popover placement="bottom-end" :width="220" trigger="click">
                <template #reference>
                  <div class="h-9 w-full rounded-md border border-slate-200 bg-white flex items-center justify-between px-3 cursor-pointer hover:border-blue-400 transition-colors">
                    <div class="w-4 h-4 rounded shadow-sm" :style="{ backgroundColor: form.colorHex }"></div>
                    <el-icon class="text-slate-400"><ArrowDown /></el-icon>
                  </div>
                </template>
                <div class="flex flex-wrap gap-2 p-1">
                  <div v-for="color in preDefinedColors" :key="color.hex" @click="selectType(color)"
                    class="w-6 h-6 rounded cursor-pointer flex items-center justify-center text-white hover:scale-110 transition-transform" 
                    :style="{ backgroundColor: color.hex }">
                    <el-icon v-if="form.colorHex === color.hex" :size="12"><Check /></el-icon>
                  </div>
                </div>
              </el-popover>
            </el-form-item>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
            <el-form-item label="Responsável *" prop="userId" class="saas-input-group">
              <el-select v-model="form.userId" filterable class="w-full" placeholder="Selecione">
                <el-option v-for="user in store.availableUsers" :key="user.id" :label="user.name" :value="user.id" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="!form.isBlocker" label="Cliente Vinculado" prop="client" class="saas-input-group">
              <el-select v-model="form.client" filterable placeholder="Selecionar cliente..." :loading="loadingClients" @focus="loadClients" no-data-text="Nenhum cliente encontrado" class="w-full">
                <el-option v-for="c in clientOptions" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="Criado por" class="saas-input-group">
              <el-input :model-value="form.createdBy || currentUserName" disabled class="!bg-slate-50" />
            </el-form-item>
          </div>

          <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 mt-2">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-0">
              <el-form-item label="Data Principal *" prop="date" class="saas-input-group !mb-0">
                <el-date-picker v-model="form.date" type="date" format="DD/MM/YYYY" value-format="YYYY-MM-DD" class="!w-full" placeholder="DD/MM/AAAA" />
              </el-form-item>
              
              <el-form-item label="Início *" prop="time" class="saas-input-group !mb-0">
                <el-time-select v-model="form.time" start="00:00" step="00:15" end="23:45" class="!w-full" @change="handleStartTimeChange" placeholder="00:00" />
              </el-form-item>
              
              <el-form-item label="Término *" prop="endTime" class="saas-input-group !mb-0">
                <el-time-select v-model="form.endTime" :min-time="form.time" start="00:00" step="00:15" end="23:45" class="!w-full" placeholder="00:00" />
              </el-form-item>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'details'" class="animate-fade-in pt-2">
          <el-form-item label="Descrição / Notas" class="saas-input-group">
            <div class="border border-slate-200 rounded-lg overflow-hidden w-full">
              <RichTextEditor v-model="form.description" />
            </div>
          </el-form-item>

          <div v-if="!form.isBlocker" class="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-0 mt-4">
            <el-form-item label="CEP" class="md:col-span-1 saas-input-group">
              <el-input v-model="form.cep" @input="formatAndSearchCep" maxlength="9" placeholder="00000-000" />
            </el-form-item>
            <el-form-item label="Endereço / Link Online" class="md:col-span-3 saas-input-group">
              <el-input v-model="form.address" placeholder="Rua, número ou URL" />
            </el-form-item>
          </div>
        </div>

        <div v-show="activeTab === 'recurrence'" class="animate-fade-in pt-2">
          
          <div class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h4 class="text-sm font-bold text-slate-800">Repetir Evento</h4>
                <p class="text-xs text-slate-500 mt-0.5">Criar uma série na agenda</p>
              </div>
              <el-switch v-model="form.isRecurring" style="--el-switch-on-color: #4f46e5;" />
            </div>

            <div v-if="form.isRecurring">
              <el-form-item label="Frequência" class="saas-input-group">
                <el-radio-group v-model="form.recurrenceType" class="saas-radio-segment">
                  <el-radio-button value="daily">Diário</el-radio-button>
                  <el-radio-button value="weekly">Semanal</el-radio-button>
                  <el-radio-button value="monthly">Mensal</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="form.recurrenceType === 'weekly'" label="Dias da Semana" class="saas-input-group">
                <div class="flex flex-wrap gap-2">
                  <div v-for="(day, idx) in weekDays" :key="idx" 
                       @click="toggleDay(idx)"
                       :class="form.recurrenceDays?.includes(idx) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'"
                       class="h-9 px-4 rounded-md border flex items-center justify-center text-xs font-bold cursor-pointer transition-all">
                    {{ day }}
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="Data Limite (Opcional)" class="saas-input-group !mb-0">
                <el-date-picker v-model="form.recurrenceEndDate" type="date" format="DD/MM/YYYY" value-format="YYYY-MM-DD" placeholder="DD/MM/AAAA" class="!w-full" />
              </el-form-item>
            </div>
            
            <div v-else class="py-8 text-center opacity-50">
              <el-icon size="32" class="text-slate-400 mb-2"><Timer /></el-icon>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Evento Único</p>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'postMeeting'" class="animate-fade-in pt-2">
          <div class="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6 flex gap-3">
            <el-icon class="text-amber-500 text-lg shrink-0 mt-0.5"><WarningFilled /></el-icon>
            <p class="text-xs font-medium text-amber-900 leading-relaxed">
              Registre atas, acordos e observações após a conclusão. Este histórico é valioso para a gestão do cliente.
            </p>
          </div>
          <el-form-item class="saas-input-group !mb-0">
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white w-full">
              <RichTextEditor v-model="form.postMeetingNotes" />
            </div>
          </el-form-item>
        </div>

      </div>
    </el-form>

    <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-[16px] z-10 relative">
      <el-button v-if="isEditing" type="danger" text class="!font-bold !rounded-md hover:!bg-red-100" @click="$emit('delete', form.id)">
        <el-icon class="mr-1"><Delete /></el-icon> Excluir
      </el-button>
      <div v-else></div>

      <div class="flex gap-3">
        <el-button @click="handleClose" class="!font-bold !rounded-md !border-slate-300 !text-slate-600 hover:!bg-slate-100">
          Cancelar
        </el-button>
        <el-button type="primary" :loading="loadingClients" @click="submitForm" class="!font-bold !rounded-md !bg-blue-600 !border-none hover:!bg-blue-700 shadow-sm">
          Salvar Registro
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  Calendar, EditPen, Checked, Lock, InfoFilled, Location, Refresh, ArrowDown,
  DocumentChecked, Check, Timer, WarningFilled, Delete 
} from '@element-plus/icons-vue';
import { useEventModal } from '../composables/useEventModal';
import RichTextEditor from '@/components/RichTextEditor.vue';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

const props = defineProps<{ isOpen: boolean; eventData?: any; }>();
const emit = defineEmits(['close', 'save', 'delete']);

const authStore = useAuthStore();
const currentUserName = computed(() => authStore.user?.name || 'Você');

const {
  store, ruleFormRef, activeTab, weekDays, isEditing, clientOptions, loadingClients,
  form, rules, preDefinedColors, formatAndSearchCep, handleStartTimeChange, loadClients, refreshClientOptions,
  selectType, handleClose, submitForm, getSelectedClientName
} = useEventModal(props, emit);

const toggleDay = (idx: number) => {
  if (!form.recurrenceDays) form.recurrenceDays = [];
  const i = form.recurrenceDays.indexOf(idx);
  if (i > -1) form.recurrenceDays.splice(i, 1);
  else form.recurrenceDays.push(idx);
};
</script>

<style scoped>
:deep(.saas-enterprise-modal .el-dialog__header) { display: none !important; }
:deep(.saas-enterprise-modal .el-dialog__body) { padding: 0 !important; }

.saas-tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}
.saas-tab-btn:hover { background-color: #f1f5f9; color: #334155; }
.saas-tab-btn.active { background-color: #e0e7ff; color: #4f46e5; font-weight: 700; }
.saas-tab-btn.disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.saas-scroll::-webkit-scrollbar { width: 6px; }
.saas-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }

.saas-input-group {
  position: relative;
  margin-bottom: 24px !important; 
}
.saas-input-group :deep(.el-form-item__label) {
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #475569 !important;
  padding-bottom: 4px !important;
  line-height: 1.2 !important;
  white-space: normal !important; 
}
.saas-input-group :deep(.el-form-item__content) {
  position: relative !important;
}

.saas-input-group :deep(.el-form-item__error) {
  position: absolute !important;
  top: calc(100% + 6px) !important;
  left: 0 !important;
  padding-top: 0 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #ef4444 !important;
  line-height: 1 !important;
}

.saas-input-group :deep(.el-input__wrapper), 
.saas-input-group :deep(.el-select__wrapper) {
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background-color: #ffffff !important;
  height: 36px;
  padding: 0 12px !important;
  transition: all 0.2s;
}
.saas-input-group :deep(.el-input__inner) {
  font-size: 13px !important;
  color: #1e293b !important;
}
.saas-input-group :deep(.el-input__wrapper.is-focus),
.saas-input-group :deep(.el-select__wrapper.is-focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}
.saas-input-group.is-error :deep(.el-input__wrapper),
.saas-input-group.is-error :deep(.el-select__wrapper) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15) !important;
}

.saas-radio-segment {
  display: flex;
  background-color: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  width: 100%;
}
.saas-radio-segment :deep(.el-radio-button) { flex: 1; }
.saas-radio-segment :deep(.el-radio-button__inner) {
  width: 100%;
  border: none !important;
  background: transparent !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #64748b !important;
  padding: 8px 0 !important;
  box-shadow: none !important;
}
.saas-radio-segment :deep(.el-radio-button__original-radio:checked+.el-radio-button__inner) {
  background-color: #ffffff !important;
  color: #4f46e5 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
}
</style>