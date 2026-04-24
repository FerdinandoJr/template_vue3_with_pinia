<template>
  <div class="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm max-w-5xl animate-fade-in" style="min-height: 600px; display: flex; flex-direction: column;">
      
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 class="text-[22px] font-black text-slate-800 mb-1 tracking-tight">Controle de Acesso por Usuário</h2>
          <p class="text-[13px] font-medium text-slate-500">Selecione um usuário e configure quais módulos ele pode acessar.</p>
        </div>
        <div class="flex items-center gap-3">
          <el-button type="primary" size="large" class="!font-bold !rounded-xl" @click="openCreateUserModal">
            <el-icon class="mr-2"><Plus /></el-icon>
            Novo Usuário
          </el-button>
          <div class="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase border border-purple-100 shrink-0 text-center flex items-center gap-2">
            <el-icon class="text-lg"><User /></el-icon>
            Acesso por Usuário
          </div>
        </div>
      </div>

      <div class="mb-4 shrink-0">
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
            <span class="text-sm font-bold text-slate-700">{{ user.name }}</span>
          </el-option>
        </el-select>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col" style="min-height: 0;">
        <div v-if="!selectedUserId" class="flex flex-col items-center justify-center text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-full">
          <el-icon class="text-5xl text-slate-300 mb-3"><UserFilled /></el-icon>
          <h3 class="text-base font-black text-slate-600">Selecione um Usuário</h3>
          <p class="text-sm font-medium text-slate-400 mt-1 max-w-sm">Escolha um usuário acima para configurar suas permissões de acesso.</p>
        </div>

        <template v-else>
          <el-tabs v-model="activeModuleTab" class="enterprise-tabs w-full flex-1" style="display: flex; flex-direction: column;">
            
            <el-tab-pane :name="'settings'" class="flex-1" style="flex: 1;">
              <template #label>
                <span class="flex items-center gap-2 px-2">
                  <el-icon><Setting /></el-icon> 
                  Configurações
                </span>
              </template>
              <div class="pb-2 animate-in fade-in duration-300 overflow-auto max-h-[400px]">
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
            
            <el-tab-pane v-for="mod in availableModules" :key="mod.id" :name="mod.id" class="flex-1" style="flex: 1;">
              <template #label>
                <span class="flex items-center gap-2 px-2">
                  <el-icon class="text-lg"><component :is="mod.icon" /></el-icon> 
                  {{ mod.name }}
                  <span v-if="!form.modules[mod.id]?.active" class="w-2 h-2 rounded-full bg-red-500 ml-1 shadow-sm" title="Desativado"></span>
                </span>
              </template>

              <div class="pb-2 animate-in fade-in duration-300 overflow-auto max-h-[400px]">
                
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
      </div>

      <div v-if="selectedUserId" class="flex justify-end pt-4 border-t border-slate-100 mt-4 shrink-0">
        <el-button 
          type="primary" 
          size="large" 
          :loading="loading" 
          @click="savePermissions" 
          class="!bg-purple-600 hover:!bg-purple-700 !border-none !rounded-xl !h-12 !px-8 !text-[13px] !font-bold tracking-wide"
        >
          <el-icon class="mr-2"><Check /></el-icon> Salvar Permissões
        </el-button>
      </div>
      
  </div>
  
  <!-- Modal Criar Usuário -->
  <el-dialog v-model="isCreateUserModalOpen" title="Criar Novo Usuário" width="500px" destroy-on-close>
    <div class="flex flex-col gap-4">
      <div>
        <label class="block text-[12px] font-bold text-slate-600 uppercase tracking-widest mb-2">Nome Completo</label>
        <el-input v-model="createUserForm.name" placeholder="João Silva" size="large" />
      </div>
      
      <div>
        <label class="block text-[12px] font-bold text-slate-600 uppercase tracking-widest mb-2">E-mail</label>
        <el-input v-model="createUserForm.email" placeholder="joao@empresa.com" size="large" />
      </div>
      
      <div>
        <label class="block text-[12px] font-bold text-slate-600 uppercase tracking-widest mb-2">Senha</label>
        <el-input v-model="createUserForm.password" type="password" placeholder="Mínimo 6 caracteres" size="large" show-password />
      </div>
      
      <div>
        <label class="block text-[12px] font-bold text-slate-600 uppercase tracking-widest mb-2">Cargo</label>
        <el-select v-model="createUserForm.role" size="large" class="w-full">
          <el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>
      
      <div v-if="createUserError" class="text-red-500 text-sm font-bold">{{ createUserError }}</div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="isCreateUserModalOpen = false">Cancelar</el-button>
        <el-button type="primary" :loading="createUserLoading" @click="createUser">
          Criar Usuário
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, markRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Calendar, User as UserIcon, ChatDotRound, Phone, Monitor, DataBoard, Collection, DataLine, Key, Lock, Setting, QuestionFilled, InfoFilled, UserFilled, Plus, Odometer } from '@element-plus/icons-vue';
import { settingsServices, type UserWithPermissions } from '../../data/settings.services';

interface ModulePermissionGroup {
  title: string;
  colorClass: string;
  switchColor: string;
  features: { id: string; name: string }[];
}

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  permissionGroups?: ModulePermissionGroup[];
}

const availableModules = ref<ModuleConfig[]>([
  { id: 'customer', name: 'Clientes', description: 'Gestão de Contatos', icon: markRaw(UserIcon) },
  { id: 'atendimentos', name: 'Atendimentos', description: 'Tickets de Suporte', icon: markRaw(Phone) },
  { id: 'chats', name: 'Chats', description: 'Central de WhatsApp', icon: markRaw(ChatDotRound) },
  { id: 'kanban', name: 'Kanban', description: 'Acompanhamento Visual', icon: markRaw(DataBoard) },
  { id: 'calendar', name: 'Agenda', description: 'Horários e Agendamentos', icon: markRaw(Calendar) },
  { id: 'relatorios', name: 'Relatórios', description: 'Gráficos do Dashboard', icon: markRaw(DataLine) },
  { id: 'kb', name: 'FAQ', description: 'Artigos e Manuais', icon: markRaw(Collection) },
  { id: 'monitor', name: 'Monitor', description: 'Painel em Tempo Real', icon: markRaw(Odometer) },
]);

const users = ref<UserWithPermissions[]>([]);
const selectedUserId = ref<string | null>(null);
const selectedUser = ref<UserWithPermissions | null>(null);
const activeModuleTab = ref('settings');

const modulePermissions: Record<string, any> = {
  customer: {
    permissionGroups: [
      { title: 'Operações de Registro', colorClass: 'bg-emerald-400', switchColor: '#10b981',
        features: [
          { id: 'create', name: 'Cadastrar novos clientes' },
          { id: 'edit', name: 'Editar dados cadastrais' },
          { id: 'delete', name: 'Excluir registro de cliente' }
        ]
      }
    ]
  },
  atendimentos: {
    permissionGroups: [
      { title: 'Gestão do Ticket', colorClass: 'bg-blue-400', switchColor: '#3b82f6',
        features: [
          { id: 'create_ticket', name: 'Criar novos chamados' },
          { id: 'edit_ticket', name: 'Editar chamados e status' },
          { id: 'delete_ticket', name: 'Excluir chamados' }
        ]
      }
    ]
  },
  chats: {
    permissionGroups: [
      { title: 'Operações de Chat', colorClass: 'bg-blue-400', switchColor: '#3b82f6',
        features: [
          { id: 'take_over', name: 'Assumir chats em andamento' },
          { id: 'transfer_chat', name: 'Transferir chats para outros setores' },
          { id: 'finish_chat', name: 'Finalizar atendimentos' }
        ]
      }
    ]
  },
  kanban: {
    permissionGroups: [
      { title: 'Gestão de Quadros', colorClass: 'bg-purple-400', switchColor: '#a855f7',
        features: [
          { id: 'create_board', name: 'Criar novos quadros' },
          { id: 'edit_board', name: 'Editar nome e configurações' },
          { id: 'delete_board', name: 'Excluir quadros' }
        ]
      },
      { title: 'Gestão de Colunas', colorClass: 'bg-indigo-400', switchColor: '#6366f1',
        features: [
          { id: 'create_column', name: 'Criar novas colunas' },
          { id: 'edit_column', name: 'Editar e reordenar colunas' },
          { id: 'delete_column', name: 'Excluir colunas' }
        ]
      },
      { title: 'Movimentação e Edição', colorClass: 'bg-violet-400', switchColor: '#8b5cf6',
        features: [
          { id: 'move_cards', name: 'Arrastar e mover cartões' },
          { id: 'edit_cards', name: 'Editar conteúdo dos cartões' }
        ]
      }
    ]
  },
  calendar: {
    permissionGroups: [
      { title: 'Gestão de Eventos', colorClass: 'bg-emerald-400', switchColor: '#10b981',
        features: [
          { id: 'create_event', name: 'Criar agendamentos e bloqueios' },
          { id: 'edit_event', name: 'Alterar horários e dados' },
          { id: 'delete_event', name: 'Excluir compromissos' }
        ]
      }
    ]
  },
  relatorios: {
    permissionGroups: [
      { title: 'Acesso às Métricas', colorClass: 'bg-orange-400', switchColor: '#f97316',
        features: [
          { id: 'view_metrics', name: 'Visualizar gráficos (ApexCharts)' }
        ]
      }
    ]
  },
  kb: {
    permissionGroups: [
      { title: 'Gestão de Conteúdo', colorClass: 'bg-emerald-400', switchColor: '#10b981',
        features: [
          { id: 'create_article', name: 'Criar e salvar artigos' },
          { id: 'edit_article', name: 'Editar artigos existentes' },
          { id: 'delete_article', name: 'Excluir artigos da base' }
        ]
      }
    ]
  },
  monitor: {
    permissionGroups: [
      { title: 'Visualização', colorClass: 'bg-cyan-400', switchColor: '#06b6d4',
        features: [
          { id: 'view_dashboard', name: 'Visualizar dashboard em tempo real' }
        ]
      }
    ]
  }
};

availableModules.value.forEach((mod: any) => {
  if (modulePermissions[mod.id]) {
    mod.permissionGroups = modulePermissions[mod.id].permissionGroups;
  }
});

const loading = ref(false);

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
  availableModules.value.forEach((mod: any) => {
    form.modules[mod.id] = { active: true, features: {} };
    if (mod.permissionGroups) {
      mod.permissionGroups.forEach((group: any) => {
        group.features.forEach((feat: any) => {
          form.modules[mod.id].features[feat.id] = true;
        });
      });
    }
  });
};

onMounted(async () => {
  try {
    console.log('Fetching users from API...');
    users.value = await settingsServices.getAllUsers();
    console.log('Users fetched:', users.value);
    initModulesForm();
  } catch (error) {
    console.error('Error fetching users:', error);
    const savedUsers = localStorage.getItem('datacrm_users');
    if (savedUsers) {
      users.value = JSON.parse(savedUsers);
    }
  }
});

const onUserChange = async (userId: string) => {
  selectedUserId.value = userId;
  selectedUser.value = users.value.find(u => u.id === userId) || null;
  
  try {
    const userPerms = await settingsServices.getUserPermissions(userId);
    console.log('User permissions from API:', userPerms);
    
    if (userPerms?.permissions && Object.keys(userPerms.permissions).length > 0) {
      form.useCustomPermissions = true;
      Object.keys(userPerms.permissions).forEach(key => {
        if (form.modules[key]) {
          form.modules[key].active = userPerms.permissions[key].active;
          if (userPerms.permissions[key].features) {
            Object.assign(form.modules[key].features, userPerms.permissions[key].features);
          }
        }
      });
    } else {
      form.useCustomPermissions = false;
      initModulesForm();
    }
  } catch (error) {
    console.error('Error loading permissions:', error);
    form.useCustomPermissions = false;
    initModulesForm();
  }
  
  activeModuleTab.value = 'settings';
};

const savePermissions = async () => {
  if (!selectedUserId.value) return;
  
  loading.value = true;
  try {
    console.log('Saving permissions for user:', selectedUserId.value);
    console.log('useCustomPermissions:', form.useCustomPermissions);
    
    if (form.useCustomPermissions) {
      const permissionsToSave: any = {};
      
      availableModules.value.forEach((mod: any) => {
        const moduleData = form.modules[mod.id];
        if (moduleData) {
          permissionsToSave[mod.id] = {
            active: moduleData.active === true,
            features: {}
          };
          
          if (mod.permissionGroups) {
            mod.permissionGroups.forEach((group: any) => {
              group.features.forEach((feat: any) => {
                permissionsToSave[mod.id].features[feat.id] = moduleData.features[feat.id] === true;
              });
            });
          }
        }
      });
      
      console.log('Permissions to save:', JSON.stringify(permissionsToSave));
      
      const result = await settingsServices.updateUserPermissions(selectedUserId.value, permissionsToSave);
      console.log('Saved permissions:', result);
      
      const userIndex = users.value.findIndex(u => u.id === selectedUserId.value);
      if (userIndex !== -1) {
        users.value[userIndex].permissions = permissionsToSave;
      }
      
      ElMessage({ message: 'Permissões salvas com sucesso!', type: 'success', customClass: 'font-bold' });
    } else {
      ElMessage({ message: 'Permissões customizadas removidas. Usuário voltará a usar configurações padrão.', type: 'info', customClass: 'font-bold' });
    }
    
    window.dispatchEvent(new CustomEvent('user-permissions-updated'));
  } catch (error) {
    console.error('Error saving permissions:', error);
    ElMessage.error('Erro ao salvar permissões.');
  } finally {
    loading.value = false;
  }
};

// Criar usuário
const isCreateUserModalOpen = ref(false);
const createUserForm = reactive({
  name: '',
  email: '',
  password: '',
  role: 'AGENT',
});
const createUserLoading = ref(false);
const createUserError = ref('');

const roleOptions = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'MANAGER', label: 'Gerente' },
  { value: 'AGENT', label: 'Atendente' },
  { value: 'CUSTOMER', label: 'Cliente' },
];

const openCreateUserModal = () => {
  createUserForm.name = '';
  createUserForm.email = '';
  createUserForm.password = '';
  createUserForm.role = 'AGENT';
  createUserError.value = '';
  isCreateUserModalOpen.value = true;
};

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const createUser = async () => {
  createUserError.value = '';
  
  if (!createUserForm.name.trim()) {
    createUserError.value = 'O nome é obrigatório';
    return;
  }
  
  if (!validateEmail(createUserForm.email)) {
    createUserError.value = 'Email inválido';
    return;
  }
  
  if (!createUserForm.password || createUserForm.password.length < 6) {
    createUserError.value = 'Senha deve ter pelo menos 6 caracteres';
    return;
  }
  
  createUserLoading.value = true;
  try {
    await settingsServices.createUser({
      name: createUserForm.name.trim(),
      email: createUserForm.email.trim().toLowerCase(),
      password: createUserForm.password,
      role: createUserForm.role,
    });
    
    ElMessage.success('Usuário criado com sucesso!');
    isCreateUserModalOpen.value = false;
    
    users.value = await settingsServices.getAllUsers();
  } catch (error: any) {
    console.error('Error creating user:', error);
    createUserError.value = error?.response?.data?.message || 'Erro ao criar usuário';
  } finally {
    createUserLoading.value = false;
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