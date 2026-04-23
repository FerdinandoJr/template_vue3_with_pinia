<template>
  <div class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-3xl animate-fade-in">
    
    <div class="mb-8">
      <h2 class="text-xl font-black text-slate-800 mb-1">Preferências de Notificação</h2>
      <p class="text-[13px] font-medium text-slate-500">Gerencie como e quando você deseja ser avisado pelo sistema.</p>
    </div>

    <div class="flex flex-col gap-4 mb-8">
      
      <div class="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#f8fafd] hover:border-blue-200 hover:shadow-sm transition-all duration-200">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500 border border-blue-50">
            <el-icon class="text-xl"><Service /></el-icon>
          </div>
          <div>
            <h4 class="text-[14px] font-black text-slate-800 tracking-tight">Sons de Novas Mensagens</h4>
            <p class="text-[12px] font-medium text-slate-500 mt-0.5">Toca um alerta sonoro quando um cliente enviar mensagem no chat.</p>
          </div>
        </div>
        <el-switch v-model="form.chatSounds" style="--el-switch-on-color: #3b82f6;" size="large" />
      </div>

      <div 
        v-if="authStore.hasRole(['ADMIN', 'MANAGER', 'AGENT'])"
        class="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#f8fafd] hover:border-orange-200 hover:shadow-sm transition-all duration-200"
      >
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500 border border-orange-50">
            <el-icon class="text-xl"><Timer /></el-icon>
          </div>
          <div>
            <h4 class="text-[14px] font-black text-slate-800 tracking-tight">Alertas de Tempo de Fila</h4>
            <p class="text-[12px] font-medium text-slate-500 mt-0.5">Notifica se algum cliente esperar atendimento além do limite configurado.</p>
          </div>
        </div>
        <el-switch v-model="form.queueAlerts" style="--el-switch-on-color: #f97316;" size="large" />
      </div>

      <div class="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-[#f8fafd] hover:border-purple-200 hover:shadow-sm transition-all duration-200">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-500 border border-purple-50">
            <el-icon class="text-xl"><Message /></el-icon>
          </div>
          <div>
            <h4 class="text-[14px] font-black text-slate-800 tracking-tight">E-mails Automáticos</h4>
            <p class="text-[12px] font-medium text-slate-500 mt-0.5">Receba relatórios diários e resumos de tickets pendentes no seu e-mail.</p>
          </div>
        </div>
        <el-switch v-model="form.autoEmails" style="--el-switch-on-color: #8b5cf6;" size="large" />
      </div>

    </div>

    <div class="flex justify-end pt-5 border-t border-slate-100">
      <el-button 
        type="primary" 
        size="large" 
        :loading="loading" 
        @click="savePreferences" 
        class="!bg-blue-600 hover:!bg-blue-700 !border-none !rounded-xl !h-12 !px-8 !font-black tracking-wide shadow-md shadow-blue-200"
      >
        <el-icon class="mr-2"><Check /></el-icon> Salvar
      </el-button>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Service, Timer, Message, Check } from '@element-plus/icons-vue';
import { settingsServices } from '../../data/settings.services';
import { useAuthStore } from '@/modules/auth/ui/store/auth.store';

const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  chatSounds: true,
  queueAlerts: false,
  autoEmails: true
});

onMounted(async () => {
  try {
    const savedSetting = await settingsServices.get('notifications');
    if (savedSetting?.value) {
      Object.assign(form, JSON.parse(savedSetting.value));
    }
  } catch (error) {
    const savedPrefs = localStorage.getItem('datacrm_notification_prefs');
    if (savedPrefs) {
      Object.assign(form, JSON.parse(savedPrefs));
    }
  }
});

const savePreferences = async () => {
  loading.value = true;
  
  try {
    await settingsServices.set('notifications', JSON.stringify(form));
    
    ElMessage({
      message: 'Preferências de notificação salvas com sucesso!',
      type: 'success',
      icon: Check,
      customClass: 'font-bold'
    });
  } catch (error) {
    ElMessage.error('Erro ao salvar as preferências. Tente novamente.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>