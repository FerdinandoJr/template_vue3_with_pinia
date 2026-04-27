<template>
  <div class="max-w-3xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-2">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span class="text-violet-600 text-2xl">🎭</span>
        </div>
        <div>
          <h2 class="text-2xl font-black text-slate-800">Cargos</h2>
          <p class="text-sm font-medium text-slate-500">Gerencie os cargos e permissões da sua equipe</p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200/60">
        <div class="text-3xl font-black text-slate-800">{{ roles.length }}</div>
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Cargos</div>
      </div>
      <div class="bg-gradient-to-br from-violet-50 to-white rounded-2xl p-5 border border-violet-200/60">
        <div class="text-3xl font-black text-violet-600">{{ adminCount }}</div>
        <div class="text-xs font-semibold text-violet-500 uppercase tracking-wider">Administradores</div>
      </div>
      <div class="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-200/60">
        <div class="text-3xl font-black text-emerald-600">{{ activeCount }}</div>
        <div class="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Ativos</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="roles.length === 0" class="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
      <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
        <span class="text-violet-600 text-4xl">🎭</span>
      </div>
      <h3 class="text-lg font-bold text-slate-700 mb-2">Nenhum cargo configurado</h3>
      <p class="text-sm text-slate-500 mb-6">Comece criando o primeiro cargo para sua equipe</p>
      <el-button type="primary" size="large" class="!font-bold !rounded-xl" @click="openCreateModal">
        <el-icon class="mr-2"><Plus /></el-icon>
        Criar Primeiro Cargo
      </el-button>
    </div>

    <!-- Roles List -->
    <div v-else class="space-y-3">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm font-semibold text-slate-600">{{ roles.length }} cargo(s) encontrado(s)</p>
        <el-button type="primary" class="!font-semibold !rounded-lg" @click="openCreateModal">
          <el-icon class="mr-1"><Plus /></el-icon>
          Novo Cargo
        </el-button>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-2">
        <div v-for="role in roles" :key="role.id"
          class="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-200"
          :class="role.name.toLowerCase() === 'admin' ? 'bg-red-50/50 border-red-200' : ''"
        >
          <!-- Color Indicator -->
          <div class="w-4 h-4 rounded-full shadow-sm" :style="{ backgroundColor: role.color }"></div>
          
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-slate-800 truncate">{{ role.name }}</h3>
              <el-tag v-if="role.isAdmin" size="small" type="danger" effect="dark" class="font-semibold">
                Administrador
              </el-tag>
              <el-tag v-else-if="role.isActive" size="small" type="success" effect="plain" class="font-semibold">
                Ativo
              </el-tag>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <el-button 
              circle
              size="small"
              class="!border-slate-200"
              @click="openEditModal(role)"
              :disabled="role.name.toLowerCase() === 'admin'"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              circle
              size="small"
              type="danger"
              @click="confirmDelete(role)"
              :disabled="role.name.toLowerCase() === 'admin'"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Modal -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? 'Editar Cargo' : 'Criar Novo Cargo'" width="450px" class="settings-dialog">
      <div class="py-4">
        <el-form :model="form" label-position="top" class="space-y-5">
          <el-form-item label="Nome do Cargo" required>
            <el-input 
              v-model="form.name" 
              placeholder="Ex: Atendente, Gerente, Supervisor..."
              size="large"
              :disabled="isEditing && isAdminRole"
            />
          </el-form-item>
          
          <el-form-item label="Cor de Identificação">
            <div class="flex items-center gap-4">
              <el-color-picker v-model="form.color" size="large" />
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-600">Preview</p>
                <div class="flex items-center gap-2 mt-2">
                  <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: form.color }"></div>
                  <span class="text-sm font-medium text-slate-500">cor selecionada</span>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false" class="!rounded-xl">Cancelar</el-button>
          <el-button type="primary" @click="saveRole" :loading="saving" class="!rounded-xl">
            {{ isEditing ? 'Salvar Alterações' : 'Criar Cargo' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Plus, Edit, Delete, Ticket, UserFilled } from '@element-plus/icons-vue';
import { useRolesStore, Role } from '@/modules/roles/ui/store/roles.store';

const rolesStore = useRolesStore() as any;

const loading = ref(false);
const dialogVisible = ref(false);
const saving = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const roles = ref<Role[]>([]);

const form = reactive({
  name: '',
  color: '#6366f1',
});

const isAdminRole = computed(() => {
  return isEditing.value && form.name.toLowerCase() === 'admin';
});

const adminCount = computed(() => roles.value.filter(r => r.isAdmin).length);
const activeCount = computed(() => roles.value.filter(r => r.isActive).length);

onMounted(async () => {
  loading.value = true;
  await rolesStore.fetchRoles();
  roles.value = rolesStore.roles;
  loading.value = false;
});

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = '';
  form.name = '';
  form.color = '#6366f1';
  dialogVisible.value = true;
};

const openEditModal = (role: Role) => {
  isEditing.value = true;
  editingId.value = role.id;
  form.name = role.name;
  form.color = role.color;
  dialogVisible.value = true;
};

const saveRole = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('Digite o nome do cargo');
    return;
  }

  saving.value = true;
  try {
    if (isEditing.value) {
      await rolesStore.updateRole(editingId.value, { name: form.name, color: form.color });
      ElMessage.success('Cargo atualizado com sucesso!');
    } else {
      await rolesStore.createRole({ name: form.name, color: form.color });
      ElMessage.success('Cargo criado com sucesso!');
    }
    dialogVisible.value = false;
    roles.value = rolesStore.roles;
  } catch (error: any) {
    ElMessage.error(error.message || 'Erro ao salvar cargo');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `Tem certeza que deseja excluir o cargo "${role.name}"? Esta ação não pode ser desfeita.`,
      'Confirmar Exclusão',
      { confirmButtonText: 'Excluir', cancelButtonText: 'Cancelar', type: 'warning' }
    );
    await rolesStore.deleteRole(role.id);
    ElMessage.success('Cargo excluído');
    roles.value = rolesStore.roles;
  } catch {}
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

:deep(.settings-dialog .el-dialog__header) {
  background: linear-gradient(to right, #f8fafc, #fff);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
}

:deep(.settings-dialog .el-dialog__title) {
  font-weight: 700;
  font-size: 18px;
  color: #1e293b;
}

:deep(.settings-dialog .el-dialog__body) {
  padding: 0;
}
</style>