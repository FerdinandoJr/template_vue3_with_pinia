<template>
  <div class="max-w-5xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-2">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span class="text-white text-2xl">👥</span>
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800">Acesso por Usuário</h2>
          <p class="text-sm font-medium text-slate-500">Gerencie permissões e cargos da sua equipe</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div class="bg-gradient-to-br from-violet-50 to-white rounded-2xl p-5 border border-violet-200/60">
        <div class="text-3xl font-black text-violet-600">{{ users.length }}</div>
        <div class="text-xs font-semibold text-violet-500 uppercase tracking-wider">Total Usuários</div>
      </div>
      <div class="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-200/60">
        <div class="text-3xl font-black text-emerald-600">{{ activeUsers }}</div>
        <div class="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Ativos</div>
      </div>
      <div class="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200/60">
        <div class="text-3xl font-black text-slate-600">{{ allRoles.length }}</div>
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargos</div>
      </div>
      <div class="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-200/60">
        <div class="text-3xl font-black text-amber-600">{{ pendingUsers }}</div>
        <div class="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pendentes</div>
      </div>
    </div>

    <!-- User Selection -->
    <div class="bg-white rounded-3xl border border-slate-200/60 p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-slate-700">Selecionar Usuário</h3>
        <el-button type="primary" class="!font-semibold !rounded-xl" @click="openCreateUserModal">
          <span class="mr-1">➕</span>
          Novo Usuário
        </el-button>
      </div>
      
      <div class="flex gap-4">
        <el-select 
          v-model="selectedUserId" 
          placeholder="Buscar usuários..."
          filterable
          clearable
          class="flex-1"
          @change="onUserChange"
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          >
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {{ user.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-slate-700 text-sm truncate">{{ user.name }}</div>
              </div>
            </div>
          </el-option>
        </el-select>
        
        <el-select 
          v-if="selectedUserId"
          v-model="userRoleId" 
          placeholder="Cargo"
          class="w-52"
          @change="updateUserRole"
        >
          <el-option
            v-for="role in allRoles"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          >
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: role.color }"></div>
              <span>{{ role.name }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!selectedUserId" class="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
      <div class="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
        <span class="text-5xl">👤</span>
      </div>
      <h3 class="text-xl font-bold text-slate-700 mb-2">Selecione um usuário</h3>
      <p class="text-sm text-slate-500 max-w-md mx-auto">Escolha um usuário acima para gerenciar suas permissões de acesso aos módulos do sistema</p>
    </div>

    <!-- Permissions Panel -->
    <div v-else class="bg-white rounded-3xl border border-slate-200/60 overflow-hidden">
      <!-- Global Toggle -->
      <div class="p-6 border-b border-slate-100" :class="form.useCustomPermissions ? 'bg-slate-50/50' : 'bg-white'">
        <div class="flex items-center justify-between p-5 rounded-2xl transition-colors border" 
             :class="form.useCustomPermissions ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 shadow-sm' : 'bg-slate-50 border-slate-200'">
          <div class="flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-colors border"
                 :class="form.useCustomPermissions ? 'bg-violet-600 text-white border-violet-700' : 'bg-white text-slate-400 border-slate-200'">
              <span class="text-2xl">🔐</span>
            </div>
            <div>
              <h4 class="text-lg font-bold tracking-tight" :class="form.useCustomPermissions ? 'text-violet-800' : 'text-slate-700'">
                Permissões Personalizadas
              </h4>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                {{ form.useCustomPermissions ? 'Usando configurações específicas' : 'Usando configurações padrão do cargo' }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <span class="text-xs font-bold uppercase tracking-widest" :class="form.useCustomPermissions ? 'text-violet-600' : 'text-slate-400'">
              {{ form.useCustomPermissions ? 'Ativo' : ' herdado' }}
            </span>
            <el-switch v-model="form.useCustomPermissions" style="--el-switch-on-color: #9333ea;" size="large" />
          </div>
        </div>

        <div v-if="!form.useCustomPermissions" class="text-center py-8">
          <p class="text-sm text-slate-500 mb-4">Este usuário está usando as permissões definidas pelo seu cargo.</p>
          <el-button type="primary" class="!rounded-xl" @click="form.useCustomPermissions = true">
            Criar Permissões Personalizadas
          </el-button>
        </div>
      </div>

      <div v-if="form.useCustomPermissions">
        <div class="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 p-4">
          <el-tabs v-model="activeModuleTab" class="modern-tabs">
            <el-tab-pane v-for="mod in availableModules" :key="mod.id" :name="mod.id">
              <template #label>
                <span class="flex items-center gap-2">
                  <span>{{ mod.icon }}</span>
                  {{ mod.name }}
                </span>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="p-6">
          <!-- Module Tabs Content -->
          <template v-for="mod in availableModules" :key="mod.id">
            <div v-if="activeModuleTab === mod.id && mod.permissionGroups" class="space-y-6">
              <div class="flex items-center justify-between p-5 rounded-2xl border"
                   :class="form.modules[mod.id]?.active ? 'bg-white border-violet-200 shadow-sm' : 'bg-slate-50 border-slate-200'">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                       :class="form.modules[mod.id]?.active ? 'bg-violet-50 text-violet-600' : 'bg-slate-200 opacity-50'">
                    {{ mod.icon }}
                  </div>
                  <div>
                    <h4 class="text-lg font-bold" :class="form.modules[mod.id]?.active ? 'text-slate-800' : 'text-slate-500'">{{ mod.name }}</h4>
                    <p class="text-xs" :class="form.modules[mod.id]?.active ? 'text-slate-500' : 'text-slate-400'">{{ mod.description }}</p>
                  </div>
                </div>
                <el-switch v-model="form.modules[mod.id].active" :active-color="'#9333ea'" size="large" />
              </div>

              <div v-if="form.modules[mod.id]?.active" class="grid grid-cols-2 gap-4">
                <div v-for="group in mod.permissionGroups" :key="group.title" class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="w-3 h-3 rounded-full shadow-sm" :class="group.colorClass"></div>
                    <h5 class="font-bold text-slate-700">{{ group.title }}</h5>
                  </div>
                  <div class="space-y-2">
                    <label v-for="feat in group.features" :key="feat.id" 
                      class="flex items-center justify-between p-2.5 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                      <span class="text-sm font-medium text-slate-600">{{ feat.name }}</span>
                      <el-checkbox v-model="form.modules[mod.id].features[feat.id]" :true-label="true" :false-label="false" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <div class="flex justify-end pt-6 mt-6 border-t border-slate-100">
            <el-button type="primary" size="large" class="!rounded-xl !font-bold px-8" @click="savePermissions" :loading="saving">
              Salvar Alterações
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <el-dialog v-model="isCreateUserModalOpen" title="Criar Novo Usuário" width="500px" class="settings-dialog">
      <div class="space-y-4 py-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Nome Completo</label>
          <el-input v-model="createUserForm.name" placeholder="João Silva" size="large" />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">E-mail</label>
          <el-input v-model="createUserForm.email" placeholder="joao@empresa.com" size="large" />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Senha</label>
          <el-input v-model="createUserForm.password" type="password" placeholder="Mínimo 6 caracteres" size="large" show-password />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Cargo</label>
          <el-select v-model="createUserForm.roleId" size="large" class="w-full">
            <el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        
        <div v-if="createUserError" class="text-red-500 text-sm font-bold">{{ createUserError }}</div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="isCreateUserModalOpen = false" class="!rounded-xl">Cancelar</el-button>
          <el-button type="primary" @click="createUser" :loading="createUserLoading" class="!rounded-xl">
            Criar Usuário
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { settingsServices, type UserWithPermissions } from '../../data/settings.services';
import { httpClient } from '@/core/infra/HttpClient';

const users = ref<UserWithPermissions[]>([]);
const selectedUserId = ref<string | null>(null);
const selectedUser = ref<UserWithPermissions | null>(null);
const activeModuleTab = ref('customer');
const loading = ref(false);
const saving = ref(false);

const allRoles = ref<any[]>([]);
const userRoleId = ref<string>('');

const isCreateUserModalOpen = ref(false);
const createUserForm = reactive({ name: '', email: '', password: '', roleId: '' });
const createUserLoading = ref(false);
const createUserError = ref('');
const roleOptions = ref<{ value: string; label: string }[]>([]);

const availableModules = [
  { 
    id: 'customer', 
    name: 'Clientes', 
    icon: '👥', 
    description: 'Gestão de clientes e registros',
    features: [
      { id: 'create', name: 'Criar Clientes' },
      { id: 'edit', name: 'Editar Clientes' },
      { id: 'delete', name: 'Excluir Clientes' }
    ],
    permissionGroups: [
      {
        title: 'Gerenciamento de Clientes',
        colorClass: 'bg-blue-500',
        features: [
          { id: 'create', name: 'Criar Clientes' },
          { id: 'edit', name: 'Editar Clientes' },
          { id: 'delete', name: 'Excluir Clientes' }
        ]
      }
    ]
  },
  { 
    id: 'atendimentos', 
    name: 'Atendimentos', 
    icon: '🎫', 
    description: 'Tickets e chamados',
    features: [
      { id: 'create_ticket', name: 'Criar Chamados' },
      { id: 'edit_ticket', name: 'Editar Chamados' },
      { id: 'delete_ticket', name: 'Excluir Chamados' }
    ],
    permissionGroups: [
      {
        title: 'Gerenciamento de Chamados',
        colorClass: 'bg-purple-500',
        features: [
          { id: 'create_ticket', name: 'Criar Chamados' },
          { id: 'edit_ticket', name: 'Editar Chamados' },
          { id: 'delete_ticket', name: 'Excluir Chamados' }
        ]
      }
    ]
  },
  { 
    id: 'chats', 
    name: 'Conversas', 
    icon: '💬', 
    description: 'Chat em tempo real',
    features: [
      { id: 'take_over', name: 'Assumir Chat' },
      { id: 'transfer_chat', name: 'Transferir Chat' },
      { id: 'finish_chat', name: 'Finalizar Chat' }
    ],
    permissionGroups: [
      {
        title: 'Controle de Chat',
        colorClass: 'bg-green-500',
        features: [
          { id: 'take_over', name: 'Assumir Chat' },
          { id: 'transfer_chat', name: 'Transferir Chat' },
          { id: 'finish_chat', name: 'Finalizar Chat' }
        ]
      }
    ]
  },
  { 
    id: 'kanban', 
    name: 'Kanban', 
    icon: '📋', 
    description: 'Quadro Kanban',
    features: [
      { id: 'move_cards', name: 'Mover Cards' },
      { id: 'edit_cards', name: 'Editar Cards' }
    ],
    permissionGroups: [
      {
        title: 'Gestão Kanban',
        colorClass: 'bg-yellow-500',
        features: [
          { id: 'move_cards', name: 'Mover Cards' },
          { id: 'edit_cards', name: 'Editar Cards' }
        ]
      }
    ]
  },
  { 
    id: 'calendar', 
    name: 'Calendário', 
    icon: '📅', 
    description: 'Agenda e eventos',
    features: [
      { id: 'create_event', name: 'Criar Eventos' },
      { id: 'edit_event', name: 'Editar Eventos' },
      { id: 'delete_event', name: 'Excluir Eventos' }
    ],
    permissionGroups: [
      {
        title: 'Gestão de Agenda',
        colorClass: 'bg-red-500',
        features: [
          { id: 'create_event', name: 'Criar Eventos' },
          { id: 'edit_event', name: 'Editar Eventos' },
          { id: 'delete_event', name: 'Excluir Eventos' }
        ]
      }
    ]
  },
  { 
    id: 'relatorios', 
    name: 'Relatórios', 
    icon: '📊', 
    description: 'Métricas e relatórios',
    features: [
      { id: 'view_metrics', name: 'Visualizar Métricas' }
    ],
    permissionGroups: [
      {
        title: 'Acesso a Dados',
        colorClass: 'bg-indigo-500',
        features: [
          { id: 'view_metrics', name: 'Visualizar Métricas' }
        ]
      }
    ]
  },
  { 
    id: 'kb', 
    name: 'Base de Conhecimento', 
    icon: '📚', 
    description: 'Artigos e FAQs',
    features: [
      { id: 'create_article', name: 'Criar Artigos' },
      { id: 'edit_article', name: 'Editar Artigos' },
      { id: 'delete_article', name: 'Excluir Artigos' }
    ],
    permissionGroups: [
      {
        title: 'Gestão de Conteúdo',
        colorClass: 'bg-teal-500',
        features: [
          { id: 'create_article', name: 'Criar Artigos' },
          { id: 'edit_article', name: 'Editar Artigos' },
          { id: 'delete_article', name: 'Excluir Artigos' }
        ]
      }
    ]
  },
  { 
    id: 'monitor', 
    name: 'Monitor', 
    icon: '📈', 
    description: 'Painel de monitoramento',
    features: [
      { id: 'view_dashboard', name: 'Visualizar Dashboard' }
    ],
    permissionGroups: [
      {
        title: 'Monitoramento',
        colorClass: 'bg-cyan-500',
        features: [
          { id: 'view_dashboard', name: 'Visualizar Dashboard' }
        ]
      }
    ]
  },
  { 
    id: 'admin', 
    name: 'Administração do Sistema', 
    icon: '⚙️', 
    description: 'Controle de sistema e integrações',
    features: [
      { id: 'user_access', name: 'Acesso por Usuário' },
      { id: 'roles', name: 'Cargos' },
      { id: 'whatsapp', name: 'WhatsApp' },
      { id: 'dashboard', name: 'Monitor Geral' }
    ],
    permissionGroups: [
      {
        title: 'Acesso Administrativo',
        colorClass: 'bg-slate-800',
        features: [
          { id: 'user_access', name: 'Acesso por Usuário' },
          { id: 'roles', name: 'Cargos' },
          { id: 'whatsapp', name: 'WhatsApp' },
          { id: 'dashboard', name: 'Monitor Geral' }
        ]
      }
    ]
  },
];

const form = reactive<Record<string, any>>({ useCustomPermissions: false, modules: {} });

const initModulesForm = () => {
  availableModules.forEach(mod => {
    const moduleData = {
      active: true,
      features: {},
    };
    if (mod.id === 'customer') {
      moduleData.features = { create: true, edit: true, delete: false };
    } else if (['atendimentos', 'chats'].includes(mod.id)) {
      moduleData.features = mod.id === 'chats' 
        ? { take_over: true, transfer_chat: false, finish_chat: true }
        : { create_ticket: true, edit_ticket: true, delete_ticket: false };
    } else if (mod.id === 'kb') {
      moduleData.features = { create_article: false, edit_article: false, delete_article: false };
    } else if (mod.id === 'monitor') {
      moduleData.active = false;
      moduleData.features = { view_dashboard: false };
    } else if (mod.id === 'admin') {
      moduleData.active = false;
      moduleData.features = { user_access: false, roles: false, whatsapp: false, dashboard: false };
    } else {
      moduleData.features = { create_event: true, edit_event: true, delete_event: true };
    }
    form.modules[mod.id] = moduleData;
  });
};

const loadRoles = async () => {
  try {
    const response = await httpClient.get<any>('/roles');
    allRoles.value = response.data || [];
    roleOptions.value = allRoles.value.map((r: any) => ({ value: r.id, label: r.name }));
  } catch (error) {
    console.error('Error loading roles:', error);
  }
};

const loadUserRole = async (userId: string) => {
  try {
    const response = await httpClient.get<any>(`/roles/user/${userId}`);
    const userRoles = response.data || [];
    userRoleId.value = userRoles.length > 0 ? userRoles[0].id : '';
  } catch (error) {
    console.error('Error loading user role:', error);
    userRoleId.value = '';
  }
};

const updateUserRole = async () => {
  if (!selectedUserId.value || !userRoleId.value) return;
  try {
    const currentRolesRes = await httpClient.get<any>(`/roles/user/${selectedUserId.value}`);
    const currentRoles = currentRolesRes.data || [];
    for (const role of currentRoles) {
      await httpClient.delete(`/roles/${role.id}/remove/${selectedUserId.value}`);
    }
    await httpClient.post(`/roles/${userRoleId.value}/assign/${selectedUserId.value}`, {});
    ElMessage.success('Cargo atualizado com sucesso!');
  } catch (error) {
    console.error('Error updating user role:', error);
    ElMessage.error('Erro ao atualizar cargo');
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    users.value = await settingsServices.getAllUsers();
    await loadRoles();
    initModulesForm();
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
});

const onUserChange = async (userId: string) => {
  selectedUser.value = users.value.find(u => u.id === userId) || null;
  if (userId) {
    await loadUserRole(userId);
  }
  const userPerms = await settingsServices.getUserPermissions(userId);
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
};

const savePermissions = async () => {
  if (!selectedUserId.value) return;
  saving.value = true;
  try {
    const permissionsToSave: Record<string, any> = {};
    Object.keys(form.modules).forEach(modId => {
      if (form.modules[modId]) {
        permissionsToSave[modId] = {
          active: form.modules[modId].active,
          features: form.modules[modId].features,
        };
      }
    });
    await settingsServices.updateUserPermissions(selectedUserId.value, permissionsToSave);
    ElMessage.success('Permissões salvas com sucesso!');
  } catch (error) {
    console.error('Error saving permissions:', error);
    ElMessage.error('Erro ao salvar permissões.');
  } finally {
    saving.value = false;
  }
};

const openCreateUserModal = async () => {
  createUserForm.name = '';
  createUserForm.email = '';
  createUserForm.password = '';
  createUserForm.roleId = roleOptions.value[0]?.value || '';
  createUserError.value = '';
  isCreateUserModalOpen.value = true;
};

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    const userData = { name: createUserForm.name.trim(), email: createUserForm.email.trim().toLowerCase(), password: createUserForm.password, skipVerification: true };
    const result = await settingsServices.createUser(userData);
    if (createUserForm.roleId && result?.id) {
      await httpClient.post(`/roles/${createUserForm.roleId}/assign/${result.id}`, {});
    }
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

const activeUsers = computed(() => users.value.filter(u => u.isActive).length);
const pendingUsers = computed(() => users.value.filter(u => !u.isActive).length);
</script>



<style scoped>
:deep(.modern-tabs .el-tabs__item) {
  font-weight: 600;
  font-size: 14px;
}

:deep(.modern-tabs .el-tabs__item.is-active) {
  color: #9333ea;
}

:deep(.modern-tabs .el-tabs__active-bar) {
  background-color: #9333ea;
}

:deep(.settings-dialog .el-dialog__header) {
  background: linear-gradient(to right, #f8fafc, #fff);
  border-bottom: 1px solid #e2e8f0;
}
</style>

<style>
:deep(.el-select-dropdown__item),
:deep(.el-select-dropdown__item.is-hoverable) {
  padding: 12px 16px !important;
  min-height: 48px !important;
  height: auto !important;
  line-height: normal !important;
  white-space: normal !important;
}
</style>