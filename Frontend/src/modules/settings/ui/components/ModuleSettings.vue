<template>
  <div class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-5xl animate-fade-in flex flex-col">
    
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
      <div>
        <h2 class="text-[22px] font-black text-slate-800 mb-1 tracking-tight">Módulos e Controle de Acesso (ACL)</h2>
        <p class="text-[13px] font-medium text-slate-500">Navegue pelas abas abaixo para gerenciar as permissões de cada área do sistema.</p>
      </div>
      <div class="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase border border-blue-100 shrink-0 text-center flex items-center gap-2">
        <el-icon class="text-lg"><Key /></el-icon>
        Acesso Nível Gestão
      </div>
    </div>

    <el-tabs v-model="activeModuleTab" class="enterprise-tabs w-full">
      
      <el-tab-pane v-for="mod in availableModules" :key="mod.id" :name="mod.id">
        <template #label>
          <span class="flex items-center gap-2 px-2">
            <el-icon class="text-lg"><component :is="mod.icon" /></el-icon> 
            {{ mod.name }}
            <span v-if="!form[mod.id]?.active" class="w-2 h-2 rounded-full bg-red-500 ml-1 shadow-sm" title="Desativado"></span>
          </span>
        </template>

        <div class="pt-6 pb-2 animate-in fade-in duration-300">
          
          <div class="flex items-center justify-between p-5 rounded-2xl transition-colors mb-8 border" 
               :class="form[mod.id]?.active ? 'bg-[#f8fafd] border-blue-200' : 'bg-slate-50 border-slate-200'">
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors border"
                   :class="form[mod.id]?.active ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-400 border-slate-200'">
                <component :is="mod.icon" class="w-6 h-6" />
              </div>
              <div>
                <h4 class="text-base font-black tracking-tight transition-colors" :class="form[mod.id]?.active ? 'text-blue-800' : 'text-slate-700'">
                  Status do Módulo: {{ mod.name }}
                </h4>
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{{ mod.description }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <span class="text-[11px] font-black uppercase tracking-widest" :class="form[mod.id]?.active ? 'text-blue-600' : 'text-red-500'">
                {{ form[mod.id]?.active ? 'Módulo Ativado' : 'Módulo Desativado' }}
              </span>
              <el-switch v-model="form[mod.id].active" style="--el-switch-on-color: #3b82f6;" size="large" />
            </div>
          </div>

          <div v-if="!form[mod.id]?.active" class="flex flex-col items-center justify-center text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <el-icon class="text-5xl text-slate-300 mb-3"><Lock /></el-icon>
            <h3 class="text-base font-black text-slate-600">Acesso Restrito</h3>
            <p class="text-sm font-medium text-slate-400 mt-1 max-w-sm">Ative este módulo na chave acima para configurar as permissões detalhadas da sua equipe.</p>
          </div>

          <div v-else-if="mod.permissionGroups" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="group in mod.permissionGroups" :key="group.title" class="flex flex-col gap-3">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-1.5 h-4 rounded-full" :class="group.colorClass"></div>
                <h5 class="text-[11px] font-black text-slate-500 uppercase tracking-widest">{{ group.title }}</h5>
              </div>
              
              <div class="flex flex-col gap-2.5">
                <label v-for="feat in group.features" :key="feat.id" 
                       class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all cursor-pointer">
                  <span class="text-[13px] font-bold text-slate-700 leading-tight select-none pr-4">{{ feat.name }}</span>
                  <el-switch v-model="form[mod.id].features[feat.id]" size="small" :style="{ '--el-switch-on-color': group.switchColor }" />
                </label>
              </div>
            </div>
          </div>

        </div>
      </el-tab-pane>
      
    </el-tabs>

    <div class="flex justify-end pt-6 border-t border-slate-100 mt-6 shrink-0">
      <el-button 
        type="primary" 
        size="large" 
        :loading="loading" 
        @click="saveModules" 
        class="!bg-blue-600 hover:!bg-blue-700 !border-none !rounded-xl !h-14 !px-10 !text-[14px] !font-black tracking-wide shadow-lg shadow-blue-200/50 transition-transform hover:scale-[1.02]"
      >
        <el-icon class="mr-2 text-lg"><Check /></el-icon> Salvar
      </el-button>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, markRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Calendar, User, ChatDotRound, Phone, Monitor, DataBoard, Collection, DataLine, Key, Lock } from '@element-plus/icons-vue';
import { settingsServices } from '../../data/settings.services';

const loading = ref(false);

const availableModules = [
  { 
    id: 'customer', name: 'Clientes', description: 'Gestão de Contatos', icon: markRaw(User),
    permissionGroups: [
      {
        title: 'Operações de Registro', colorClass: 'bg-emerald-400', switchColor: '#10b981',
        features: [
          { id: 'create', name: 'Cadastrar novos clientes' },
          { id: 'edit', name: 'Editar dados cadastrais' },
          { id: 'delete', name: 'Excluir registro de cliente' }
        ]
      }
    ]
  },
  { 
    id: 'atendimentos', name: 'Atendimentos', description: 'Tickets de Suporte', icon: markRaw(Phone),
    permissionGroups: [
      {
        title: 'Gestão do Ticket', colorClass: 'bg-blue-400', switchColor: '#3b82f6',
        features: [
          { id: 'create_ticket', name: 'Criar novos chamados' },
          { id: 'edit_ticket', name: 'Editar chamados e status' },
          { id: 'delete_ticket', name: 'Excluir chamados' }
        ]
      }
    ]
  },
  { 
    id: 'chats', name: 'Chats', description: 'Central de WhatsApp', icon: markRaw(ChatDotRound),
    permissionGroups: [
      {
        title: 'Operações de Chat', colorClass: 'bg-blue-400', switchColor: '#3b82f6',
        features: [
          { id: 'take_over', name: 'Assumir chats em andamento' },
          { id: 'transfer_chat', name: 'Transferir chats para outros setores' },
          { id: 'finish_chat', name: 'Finalizar atendimentos' }
        ]
      }
    ]
  },
  { 
    id: 'kanban', name: 'Kanban', description: 'Acompanhamento Visual', icon: markRaw(DataBoard),
    permissionGroups: [
      {
        title: 'Movimentação e Edição', colorClass: 'bg-purple-400', switchColor: '#a855f7',
        features: [
          { id: 'move_cards', name: 'Arrastar e mover cartões' },
          { id: 'edit_cards', name: 'Editar conteúdo dos cartões' }
        ]
      }
    ]
  },
  { 
    id: 'calendar', name: 'Agenda', description: 'Horários e Agendamentos', icon: markRaw(Calendar),
    permissionGroups: [
      {
        title: 'Gestão de Eventos', colorClass: 'bg-emerald-400', switchColor: '#10b981',
        features: [
          { id: 'create_event', name: 'Criar agendamentos e bloqueios' },
          { id: 'edit_event', name: 'Alterar horários e dados' },
          { id: 'delete_event', name: 'Excluir compromissos' }
        ]
      }
    ]
  },
  { 
    id: 'relatorios', name: 'Relatórios', description: 'Gráficos do Dashboard', icon: markRaw(DataLine),
    permissionGroups: [
      {
        title: 'Acesso às Métricas', colorClass: 'bg-orange-400', switchColor: '#f97316',
        features: [
          { id: 'view_metrics', name: 'Visualizar gráficos (ApexCharts)' }
        ]
      }
    ]
  },
  { 
    id: 'kb', name: 'FAQ', description: 'Artigos e Manuais', icon: markRaw(Collection),
    permissionGroups: [
      {
        title: 'Gestão de Conteúdo', colorClass: 'bg-emerald-400', switchColor: '#10b981',
        features: [
          { id: 'create_article', name: 'Criar e salvar artigos' },
          { id: 'edit_article', name: 'Editar artigos existentes' },
          { id: 'delete_article', name: 'Excluir artigos da base' }
        ]
      }
    ]
  }
];

const activeModuleTab = ref(availableModules[0].id);
const form = reactive<Record<string, { active: boolean, features: Record<string, boolean> }>>({});

availableModules.forEach(mod => {
  form[mod.id] = { active: true, features: {} };
  if (mod.permissionGroups) {
    mod.permissionGroups.forEach(group => {
      group.features.forEach(feat => {
        form[mod.id].features[feat.id] = true;
      });
    });
  }
});

onMounted(async () => {
  try {
    const savedSetting = await settingsServices.get('permissions');
    if (savedSetting?.value) {
      const parsed = JSON.parse(savedSetting.value);
      Object.keys(parsed).forEach(key => {
        if (form[key]) {
          form[key].active = parsed[key].active;
          if (parsed[key].features && form[key].features) {
            Object.assign(form[key].features, parsed[key].features);
          }
        }
      });
    }
  } catch (error) {
    const savedModules = localStorage.getItem('datacrm_permissions');
    if (savedModules) {
      const parsed = JSON.parse(savedModules);
      Object.keys(parsed).forEach(key => {
        if (form[key]) {
          form[key].active = parsed[key].active;
          if (parsed[key].features && form[key].features) {
            Object.assign(form[key].features, parsed[key].features);
          }
        }
      });
    }
  }
});

const saveModules = async () => {
  loading.value = true;
  try {
    const permissionsJson = JSON.stringify(form);
    await settingsServices.set('permissions', permissionsJson);
    
    const activeModulesSimple = Object.keys(form).reduce((acc, key) => {
      acc[key] = form[key].active;
      return acc;
    }, {} as Record<string, boolean>);
    
    localStorage.setItem('datacrm_active_modules', JSON.stringify(activeModulesSimple));
    window.dispatchEvent(new CustomEvent('modules-updated'));
    
    ElMessage({ message: 'Matriz de Acesso salva com sucesso!', type: 'success', icon: Check, customClass: 'font-bold' });
  } catch (error) {
    ElMessage.error('Erro ao salvar as permissões.');
  } finally {
    loading.value = false;
  }
};
</script>

<style>
.enterprise-tabs .el-tabs__item { font-size: 14px; color: #64748b; font-weight: 700; height: 50px; }
.enterprise-tabs .el-tabs__item.is-active { color: #3b82f6; }
.enterprise-tabs .el-tabs__active-bar { background-color: #3b82f6; height: 3px; border-radius: 3px 3px 0 0; }
.enterprise-tabs .el-tabs__nav-wrap::after { background-color: #f1f5f9; height: 2px; }
.enterprise-tabs .el-tabs__header { margin-bottom: 0px; }
</style>