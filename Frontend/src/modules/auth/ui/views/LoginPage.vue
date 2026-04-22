<template>
  <div class="min-h-[100dvh] w-full flex bg-[#f8fafc] overflow-hidden">
    
    <div class="hidden lg:flex w-1/2 bg-blue-600 items-center justify-center relative">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 opacity-95"></div>
      
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-3xl"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-3xl"></div>
      
      <div class="relative z-10 text-white text-center p-12 flex flex-col items-center">
        <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-xl">
          <el-icon class="text-4xl text-white"><Monitor /></el-icon>
        </div>
        <h1 class="text-4xl font-black mb-4 tracking-tight leading-tight">Central de<br/>Atendimento</h1>
        <p class="text-blue-100 text-lg font-medium max-w-sm mx-auto leading-relaxed">
          Gerencie seus clientes, tickets, kanban e chats em um único lugar com máxima eficiência.
        </p>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
      
      <div class="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative z-10">
        
        <div class="mb-8 text-center sm:text-left">
          <div class="lg:hidden w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-200">
             <el-icon class="text-3xl text-white"><Monitor /></el-icon>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2">Bem-vindo de volta</h2>
          <p class="text-slate-500 font-medium text-sm">Insira suas credenciais para acessar o painel</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleLogin">
          
          <el-form-item label="E-mail" prop="email" class="font-bold text-slate-700">
            <el-input 
              v-model="form.email" 
              type="email" 
              placeholder="admin@datacrm.com" 
              class="custom-login-input" 
            >
              <template #prefix>
                <el-icon class="text-slate-400"><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Senha" prop="password" class="font-bold text-slate-700 mt-5">
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••" 
              show-password 
              class="custom-login-input"
            >
              <template #prefix>
                <el-icon class="text-slate-400"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="flex items-center justify-between mb-8 mt-2">
            <el-checkbox v-model="rememberMe" label="Lembrar-me" class="!text-slate-500 !font-medium" />
            <a href="#" class="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Esqueceu a senha?</a>
          </div>

          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleLogin" 
            class="w-full !h-14 !text-base !font-black !rounded-xl !bg-blue-600 hover:!bg-blue-700 !border-none shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            Entrar no Sistema
          </el-button>
          
        </el-form>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store';
import { authServices } from '@/modules/auth/data/auth.services';
import { ElMessage } from 'element-plus';
import { Monitor, Message, Lock } from '@element-plus/icons-vue';

// 1. INICIALIZAMOS O ROUTER AQUI PARA PODER VIRAR A PÁGINA
const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<any>(null);

const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const rules = {
  email: [
    { required: true, message: 'O e-mail é obrigatório', trigger: 'blur' },
    { type: 'email', message: 'Insira um e-mail válido', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'A senha é obrigatória', trigger: 'blur' },
    { min: 4, message: 'A senha deve ter pelo menos 4 caracteres', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        // Debug
        console.log('Tentando login com:', form.email, form.password);
        
        // Chamada ao backend real
        const response = await authServices.login(form.email, form.password);
        
        console.log('Response login:', response);
        
        // Salva os dados na store
        authStore.login(response.user, response.token);
        
        console.log('Store login - token:', response.token ? 'sim' : 'nao');
        console.log('Store login - user:', response.user?.name);

        ElMessage.success('Login realizado com sucesso!');
        
        // Redireciona para o dashboard
        console.log('Navegando para /');
        router.push('/');

      } catch (error: any) {
        console.error('Erro no login:', error);
        ElMessage.error(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style>
/* Refinamentos visuais para os inputs do Element Plus ficarem com aspecto Premium */
.custom-login-input .el-input__wrapper {
  height: 52px !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  background-color: #f8fafc !important;
  transition: all 0.2s ease !important;
  padding: 0 16px !important;
}

.custom-login-input .el-input__wrapper.is-focus {
  background-color: #ffffff !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

.custom-login-input .el-input__inner {
  font-weight: 600 !important;
  color: #334155 !important;
}

.custom-login-input .el-input__inner::placeholder {
  font-weight: 500 !important;
  color: #94a3b8 !important;
}
</style>