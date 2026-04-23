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
           
           <div class="mt-6 text-center">
             <span class="text-slate-500 text-sm font-medium">Não tem uma conta? </span>
             <el-button type="primary" link @click="isRegisterModalOpen = true" class="!font-bold !text-blue-600">
               Criar Conta
             </el-button>
           </div>
           
         </el-form>
      </div>
      
    </div>
    
    <!-- Modal Criar Conta -->
    <el-dialog v-model="isRegisterModalOpen" title="" width="480px" destroy-on-close class="register-dialog" @close="registerStep = 1; registerSuccess = ''">
      <template #header>
        <div class="text-center py-2">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <el-icon class="text-2xl text-white"><User /></el-icon>
          </div>
          <h3 class="text-xl font-black text-slate-800">{{ registerStep === 1 ? 'Criar Nova Conta' : 'Verificar E-mail' }}</h3>
          <p class="text-sm text-slate-500 font-medium mt-1">{{ registerStep === 1 ? 'Preencha os dados abaixo para se cadastrar' : 'Enviamos um código para seu e-mail' }}</p>
        </div>
      </template>
      
      <div class="flex flex-col gap-5">
        <template v-if="registerStep === 1">
          <div>
            <label class="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Nome Completo</label>
            <el-input 
              v-model="registerForm.name" 
              placeholder="Seu nome completo"
              size="large" 
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="text-slate-400"><User /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div>
            <label class="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">E-mail</label>
            <el-input 
              v-model="registerForm.email" 
              placeholder="seu@email.com"
              size="large" 
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="text-slate-400"><Message /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div>
            <label class="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Senha</label>
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="Mínimo 6 caracteres"
              size="large" 
              show-password
              class="custom-input"
            >
              <template #prefix>
                <el-icon class="text-slate-400"><Lock /></el-icon>
              </template>
            </el-input>
          </div>
          
          <div>
            <label class="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Cargo</label>
            <el-select v-model="registerForm.role" size="large" class="w-full custom-select">
              <el-option label="Administrador" value="ADMIN">
                <div class="flex items-center gap-2">
                  <el-icon class="text-blue-600"><Star /></el-icon>
                  <span>Administrador</span>
                </div>
              </el-option>
              <el-option label="Gerente" value="MANAGER">
                <div class="flex items-center gap-2">
                  <el-icon class="text-purple-600"><DataBoard /></el-icon>
                  <span>Gerente</span>
                </div>
              </el-option>
              <el-option label="Atendente" value="AGENT">
                <div class="flex items-center gap-2">
                  <el-icon class="text-green-600"><ChatDotRound /></el-icon>
                  <span>Atendente</span>
                </div>
              </el-option>
              <el-option label="Cliente" value="CUSTOMER">
                <div class="flex items-center gap-2">
                  <el-icon class="text-slate-600"><User /></el-icon>
                  <span>Cliente</span>
                </div>
              </el-option>
            </el-select>
          </div>
        </template>
        
        <template v-else>
          <div class="text-center py-4">
            <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <el-icon class="text-3xl text-blue-600"><Message /></el-icon>
            </div>
            <p class="text-slate-600 font-medium mb-2">Código de verificação</p>
            <p class="text-xs text-slate-400 mb-4">Enviamos um código para: <span class="font-bold text-slate-600">{{ registerForm.email }}</span></p>
            <p class="text-xs text-green-600 mb-4">Verifique sua caixa de entrada ou spam</p>
          </div>
          
          <div>
            <label class="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-2">Digite o Token</label>
            <el-input 
              v-model="registerForm.token" 
              placeholder="XXXXXX"
              size="large" 
              maxlength="6"
              class="text-center tracking-widest text-xl font-bold"
            />
          </div>
          
          <div class="flex justify-center">
            <el-button type="primary" link @click="registerStep = 1; registerForm.token = ''">
              <el-icon class="mr-1"><RefreshLeft /></el-icon>
              Voltar
            </el-button>
          </div>
        </template>
        
        <div v-if="registerError" class="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <el-icon class="text-red-500"><WarningFilled /></el-icon>
          <span class="text-red-600 text-sm font-bold">{{ registerError }}</span>
        </div>
        
        <div v-if="registerSuccess" class="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <el-icon class="text-green-500"><SuccessFilled /></el-icon>
          <span class="text-green-600 text-sm font-bold">{{ registerSuccess }}</span>
        </div>
      </div>
      
      <template #footer>
        <div class="flex gap-3 justify-end pt-2">
          <el-button @click="isRegisterModalOpen = false; registerStep = 1; registerSuccess = ''" class="!h-12 !px-6 !font-bold">
            Cancelar
          </el-button>
          <el-button 
            v-if="registerStep === 1"
            type="primary" 
            :loading="registerLoading" 
            @click="handleRegister" 
            class="!h-12 !px-8 !font-bold !rounded-xl"
          >
            Continuar
          </el-button>
          <el-button 
            v-else
            type="primary" 
            :loading="registerLoading" 
            @click="handleRegister" 
            class="!h-12 !px-8 !font-bold !rounded-xl"
          >
            Verificar
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store';
import { authServices } from '@/modules/auth/data/auth.services';
import { settingsServices } from '@/modules/settings/data/settings.services';
import { ElMessage } from 'element-plus';
import { Monitor, Message, Lock, User, Star, DataBoard, ChatDotRound, WarningFilled, SuccessFilled, RefreshLeft } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<any>(null);

const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const isRegisterModalOpen = ref(false);
const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  role: 'AGENT',
  token: '',
});
const registerLoading = ref(false);
const registerError = ref('');
const registerStep = ref(1);
const registerSuccess = ref('');
const registerCurrentToken = ref('');

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

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleRegister = async () => {
  registerError.value = '';
  
  if (registerStep.value === 1) {
    if (!registerForm.name.trim()) {
      registerError.value = 'O nome é obrigatório';
      return;
    }
    
    if (!validateEmail(registerForm.email)) {
      registerError.value = 'Email inválido';
      return;
    }
    
    if (!registerForm.password || registerForm.password.length < 6) {
      registerError.value = 'Senha deve ter pelo menos 6 caracteres';
      return;
    }
    
    registerLoading.value = true;
    try {
      const response = await settingsServices.createUser({
        name: registerForm.name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password,
        role: registerForm.role,
      });
      
      if (response.token) {
        registerStep.value = 2;
        registerCurrentToken.value = response.token;
      } else {
        registerSuccess.value = 'Conta criada com sucesso! Faça login.';
        isRegisterModalOpen.value = false;
        form.email = registerForm.email;
        form.password = '';
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      registerError.value = error?.response?.data?.message || 'Erro ao criar conta';
    } finally {
      registerLoading.value = false;
    }
  } else if (registerStep.value === 2) {
    if (!registerForm.token || registerForm.token.length !== 6) {
      registerError.value = 'Digite o código de 6 dígitos';
      return;
    }
    
    registerLoading.value = true;
    try {
      await authServices.verifyEmail(registerForm.email.trim().toLowerCase(), registerForm.token);
      
      registerSuccess.value = 'Conta verificada! Faça login para continuar.';
      isRegisterModalOpen.value = false;
      
      form.email = registerForm.email;
      form.password = '';
      
      setTimeout(() => {
        registerStep.value = 1;
        registerForm.name = '';
        registerForm.email = '';
        registerForm.password = '';
        registerForm.token = '';
        registerSuccess.value = '';
      }, 500);
    } catch (error: any) {
      console.error('Error verifying:', error);
      registerError.value = error?.response?.data?.message || 'Token inválido ou expirado';
    } finally {
      registerLoading.value = false;
    }
  }
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