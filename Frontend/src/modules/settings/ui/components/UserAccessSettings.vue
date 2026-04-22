<template>
  <div class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-5xl animate-fade-in flex flex-col">
    
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
      <div>
        <h2 class="text-[22px] font-black text-slate-800 mb-1 tracking-tight">Controle de Acesso por Usuário</h2>
        <p class="text-[13px] font-medium text-slate-500">Selecione um usuário e configure quais módulos ele pode acessar.</p>
      </div>
      <div class="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase border border-purple-100 shrink-0 text-center flex items-center gap-2">
        <el-icon class="text-lg"><User /></el-icon>
        Acesso por Usuário
      </div>
    </div>

    <div class="mb-6">
      <label class="block text-[12px] font-bold text-slate-600 uppercase tracking-widest mb-3">Selecionar Usuário</label>
      <el-select 
        v-model="selectedUserId" 
        placeholder="Selecione um usuário..."
        filterable
        class="w-full"
        @change="onUserChange"
      >
        <el-option
          v-for="user in users"
          :key="user.id"
          :label="user.name"
          :value="user.id"
        >
          <div class="flex items-center gap-3 py-2">
            <el-avatar :size="32" :src="user.avatar" class="bg-slate-200">
              {{ user.name?.charAt(0) }}
            </el-avatar>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-700">{{ user.name }}</span>
              <span class="text-xs text-slate-400">{{ user.email }} · {{ user.role }}</span>
            </div>
          </div>
        </el-option>
      </el-select>
    </div>

    <div v-if="selectedUserId && !hasSelectedUserPermissions" class="flex flex-col items-center justify-center text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <el-icon class="text-5xl text-slate-300 mb-3"><QuestionFilled /></el-icon>
      <h3 class="text-base font-black text-slate-600">Nenhuma Configuração</h3>
      <p class="text-sm font-medium text-slate-400 mt-1 max-w-sm">Este usuário usa as permissões globais do sistema. Customize abaixo para criar regras específicas.</p>
    </div>

    <template v-if="selectedUserId">
      <el-tabs v-model="activeModuleTab" class="enterprise-tabs w-full mt-4">
        
        <el-tab-pane :name="'settings'">
          <template #label>
            <span class="flex items-center gap-2 px-2">
              <el-icon><Setting /></el-icon> 
              Configurações
            </span>
          </template>
          <div class="pt-6 pb-2 animate-in fade-in duration-300">
            <div class="flex items-center justify-between p-5 rounded-2xl transition-colors mb-6 border" 
                 :class="form.useCustomPermissions ? 'bg-[#f8fafd] border-purple-200' : 'bg-slate-50 border-slate-200'">
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors border"
                     :class="form.useCustomPermissions ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-slate-400 border-slate-200'">
                  <Key class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="text-base font-black tracking-tight transition-colors" :class="form.useCustomPermissions ? 'text-purple-800' : 'text-slate-700'">
                    Permissões Personalizadas
                  </h4>
                  <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Usar configurações específicas deste usuário</p>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <span class="text-[11px] font-black uppercase tracking-widest" :class="form.useCustomPermissions ? 'text-purple-600' : 'text-slate-400'">
                  {{ form.useCustomPermissions ? 'Personalizado' : 'Padrão' }}
                </span>
                <el-switch v-model="form.useCustomPermissions" style="--el-switch-on-color: #9333ea;" size="large" />
              </div>
            </div>

            <div v-if="!form.useCustomPermissions" class="flex flex-col items-center justify-center text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <el-icon class="text-4xl text-slate-300 mb-3"><InfoFilled /></el-icon>
              <h4 class="text-sm font-black text-slate-600">Usando Permissões Globais</h4>
              <p class="text-xs font-medium text-slate-400 mt-1">Este usuário seguirá as configurações definidas na aba "Módulos do Sistema".</p>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane v-for="mod in availableModules" :key="mod.id" :name="mod.id">
          <template #label>
            <span class="flex items-center gap-2 px-2">
              <el-icon class="text-lg"><component :is="mod.icon" /></el-icon> 
              {{ mod.name }}
              <span v-if="!form.modules[mod.id]?.active" class="w-2 h-2 rounded-full bg-red-500 ml-1 shadow-sm" title="Desativado"></span>
            </span>
          </template>

          <div class="pt-6 pb-2 animate-in fade-in duration-300">
            
            <div class="flex items-center justify-between p-5 rounded-2xl transition-colors mb-6 border" 
                 :class="form.modules[mod.id]?.active ? 'bg-[#f8fafd] border-purple-200' : 'bg-slate-50 border-slate-200'">
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors border"
                     :class="form.modules[mod.id]?.active ? 'bg-purple-600 text-white border-purple-700' : 'bg-white text-slate-400 border-slate-200'">
                  <component :is="mod.icon" class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="text-base font-black tracking-tight transition-colors" :class="form.modules[mod.id]?.active ? 'text-purple-800' : 'text-slate-700'">
                    Módulo: {{ mod.name }}
                  </h4>
                  <p class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{{ mod.description }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                <span class="text-[11px] font-black uppercase tracking-widest" :class="form.modules[mod.id]?.active ? 'text-purple-600' : 'text-red-500'">
                  {{ form.modules[mod.id]?.active ? 'Acesso Ativado' : 'Acesso Bloqueado' }}
                </span>
                <el-switch v-model="form.modules[mod.id].active" style="--el-switch-on-color: #9333ea;" size="large" />
              </div>
            </div>

            <div v-if="!form.modules[mod.id]?.active" class="flex flex-col items-center justify-center text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <el-icon class="text-4xl text-slate-300 mb-3"><Lock /></el-icon>
              <h4 class="text-sm font-black text-slate-600">Acesso Bloqueado</h4>
              <p class="text-xs font-medium text-slate-400 mt-1">Este usuário não terá acesso ao módulo {{ mod.name }}.</p>
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
                    <el-switch v-model="form.modules[mod.id].features[feat.id]" size="small" :style="{ '--el-switch-on-color': group.switchColor }" />
                  </label>
                </div>
              </div>
            </div>

          </div>
        </el-tab-pane>
        
      </el-tabs>
    </template>

    <div v-if="selectedUserId" class="flex justify-end pt-6 border-t border-slate-100 mt-6 shrink-0">
      <el-button 
        type="primary" 
        size="large" 
        :loading="loading" 
        @click="savePermissions" 
        class="!bg-purple-600 hover:!bg-purple-700 !border-none !rounded-xl !h-14 !px-10 !text-[14px] !font-black tracking-wide shadow-lg shadow-purple-200/50 transition-transform hover:scale-[1.02]"
      >
        <el-icon class="mr-2 text-lg"><Check /></el-icon> Salvar Permissões
      </el-button>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Calendar, User as UserIcon, ChatDotRound, Phone, Monitor, DataBoard, Collection, DataLine, Key, Lock, Setting, QuestionFilled, InfoFilled } from '@element-plus/icons-vue';
import { settingsServices, type UserWithPermissions } from '../../data/settings.services';

const loading = ref(false);
const users = ref<UserWithPermissions[]>([]);
const selectedUserId = ref<string | null>(null);
const selectedUser = ref<UserWithPermissions | null>(null);
const activeModuleTab = ref('settings');

const availableModules = [
  { 
    id: 'customer', name: 'Clientes', description: 'Gestão de Contatos', icon: UserIcon,
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
    id: 'atendimentos', name: 'Atendimentos', description: 'Tickets de Suporte', icon: Phone,
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
    id: 'chats', name: 'Chats', description: 'Central de WhatsApp', icon: ChatDotRound,
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
    id: 'kanban', name: 'Kanban', description: 'Acompanhamento Visual', icon: DataBoard,
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
    id: 'calendar', name: 'Agenda', description: 'Horários e Agendamentos', icon: Calendar,
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
    id: 'relatorios', name: 'Relatórios', description: 'Gráficos do Dashboard', icon: DataLine,
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
    id: 'kb', name: 'FAQ', description: 'Artigos e Manuais', icon: Collection,
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

const form = reactive<{
  useCustomPermissions: boolean;
  modules: Record<string, { active: boolean; features: Record<string, boolean> }>;
}>({
  useCustomPermissions: false,
  modules: {},
});

const hasSelectedUserPermissions = computed(() => {
  if (!selectedUser.value) return false;
  return selectedUser.value.permissions && Object.keys(selectedUser.value.permissions).length > 0;
});

const initModulesForm = () => {
  form.modules = {};
  availableModules.forEach(mod => {
    form.modules[mod.id] = { active: true, features: {} };
    if (mod.permissionGroups) {
      mod.permissionGroups.forEach(group => {
        group.features.forEach(feat => {
          form.modules[mod.id].features[feat.id] = true;
        });
      });
    }
  });
};

onMounted(async () => {
  try {
    users.value = await settingsServices.getAllUsers();
    initModulesForm();
  } catch (error) {
    const savedUsers = localStorage.getItem('datacrm_users');
    if (savedUsers) {
      users.value = JSON.parse(savedUsers);
    }
  }
});

const onUserChange = async (userId: string) => {
  selectedUserId.value = userId;
  selectedUser.value = users.value.find(u => u.id === userId) || null;
  
  if (selectedUser.value?.permissions) {
    form.useCustomPermissions = true;
    Object.keys(selectedUser.value.permissions).forEach(key => {
      if (form.modules[key]) {
        form.modules[key].active = selectedUser.value!.permissions![key].active;
        if (selectedUser.value!.permissions![key].features) {
          Object.assign(form.modules[key].features, selectedUser.value!.permissions![key].features);
        }
      }
    });
  } else {
    form.useCustomPermissions = false;
    initModulesForm();
  }
  
  activeModuleTab.value = 'settings';
};

const savePermissions = async () => {
  if (!selectedUserId.value) return;
  
  loading.value = true;
  try {
    if (!form.useCustomPermissions) {
      await settingsServices.updateUserPermissions(selectedUserId.value, {});
    } else {
      await settingsServices.updateUserPermissions(selectedUserId.value, form.modules);
    }
    
    const userIndex = users.value.findIndex(u => u.id === selectedUserId.value);
    if (userIndex !== -1) {
      users.value[userIndex].permissions = form.useCustomPermissions ? form.modules : undefined;
    }
    
    ElMessage({ message: 'Permissões salvas com sucesso!', type: 'success', customClass: 'font-bold' });
    window.dispatchEvent(new CustomEvent('user-permissions-updated'));
  } catch (error) {
    ElMessage.error('Erro ao salvar permissões.');
  } finally {
    loading.value = false;
  }
};
</script>

<style>
.enterprise-tabs .el-tabs__item { font-size: 14px; color: #64748b; font-weight: 700; height: 50px; }
.enterprise-tabs .el-tabs__item.is-active { color: #9333ea; }
.enterprise-tabs .el-tabs__active-bar { background-color: #9333ea; height: 3px; border-radius: 3px 3px 0 0; }
.enterprise-tabs .el-tabs__nav-wrap::after { background-color: #f1f5f9; height: 2px; }
.enterprise-tabs .el-tabs__header { margin-bottom: 0px; }
</style>