<template>
  <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-black text-slate-800">Cargos dos Usuários</h2>
        <p class="text-slate-500 text-sm mt-1">Atribua cargos aos usuários</p>
      </div>
    </div>

    <div class="mb-4">
      <el-select v-model="selectedUserId" placeholder="Selecione um usuário" filterable class="w-full" @change="onUserChange">
        <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold">
              {{ user.name.charAt(0) }}
            </div>
            <span>{{ user.name }}</span>
          </div>
        </el-option>
      </el-select>
    </div>

    <div v-if="selectedUserId && loadingRoles" class="text-center py-4">
      <el-icon class="animate-spin text-purple-600"><Loading /></el-icon>
    </div>

    <div v-else-if="selectedUserId" class="space-y-2">
      <div v-for="role in allRoles" :key="role.id" 
        class="flex items-center justify-between p-3 rounded-xl border"
        :class="hasRole(role.id) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: role.color }"></div>
          <span class="font-medium" :class="hasRole(role.id) ? 'text-blue-700' : 'text-slate-600'">{{ role.name }}</span>
          <el-tag v-if="role.isAdmin" size="small" type="danger">Admin</el-tag>
        </div>
        <el-switch v-model="roleStatuses[role.id]" @change="toggleRole(role.id)" />
      </div>
    </div>

    <div v-else class="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
      Selecione um usuário para gerenciar seus cargos
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { httpClient } from '@/core/infra/HttpClient';
import { useRolesStore } from '@/modules/roles/ui/store/roles.store';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface RoleData {
  id: string;
  name: string;
  color: string;
  isAdmin: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const rolesStore = useRolesStore() as any;

const users = ref<User[]>([]);
const selectedUserId = ref<string>('');
const userRoles = ref<RoleData[]>([]);
const roleStatuses = reactive<Record<string, boolean>>({});
const loadingRoles = ref(false);
const allRoles = ref<RoleData[]>([]);

onMounted(async () => {
  await rolesStore.fetchRoles();
  allRoles.value = rolesStore.roles;
  await fetchUsers();
  
  for (const role of allRoles.value) {
    roleStatuses[role.id] = false;
  }
});

const fetchUsers = async () => {
  try {
    const response = await httpClient.get<ApiResponse<User[]>>('/users');
    users.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  }
};

const onUserChange = async () => {
  if (!selectedUserId.value) return;
  
  loadingRoles.value = true;
  try {
    const roles = await rolesStore.fetchUserRoles(selectedUserId.value);
    userRoles.value = roles as RoleData[];
    
    for (const role of allRoles.value) {
      roleStatuses[role.id] = userRoles.value.some(r => r.id === role.id);
    }
  } finally {
    loadingRoles.value = false;
  }
};

const hasRole = (roleId: string) => {
  return userRoles.value.some(r => r.id === roleId);
};

const toggleRole = async (roleId: string) => {
  if (!selectedUserId.value) return;
  
  try {
    if (roleStatuses[roleId]) {
      await rolesStore.assignRoleToUser(selectedUserId.value, roleId);
      ElMessage.success('Cargo atribuído');
    } else {
      await rolesStore.removeRoleFromUser(selectedUserId.value, roleId);
      ElMessage.success('Cargo removido');
    }
    await onUserChange();
  } catch (error: any) {
    ElMessage.error(error.message || 'Erro ao atualizar cargo');
    roleStatuses[roleId] = !roleStatuses[roleId];
  }
};
</script>