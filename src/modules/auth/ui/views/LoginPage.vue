<template>
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <div class="flex justify-center items-center mb-6">
                <div
                    class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                        <path d="M3 12A9 3 0 0 0 21 12"></path>
                    </svg>
                </div>
                <h1 class="text-3xl font-black tracking-tight italic text-slate-800">Data <span
                        class="text-blue-500 font-light">CRM</span></h1>
            </div>
            <h2 class="mt-2 text-center text-xl font-bold tracking-tight text-slate-700">Acesse sua conta</h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-[24px] sm:px-10">
                <form class="space-y-6" @submit.prevent="handleLogin">
                    <div>
                        <label for="email"
                            class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Email
                            corporativo</label>
                        <div class="mt-1">
                            <input id="email" v-model="email" name="email" type="email" autocomplete="email" required
                                class="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-slate-50 transition-colors"
                                placeholder="admin@datacrm.com" />
                        </div>
                    </div>

                    <div>
                        <label for="password"
                            class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Senha</label>
                        <div class="mt-1">
                            <input id="password" v-model="password" name="password" type="password"
                                autocomplete="current-password" required
                                class="block w-full appearance-none rounded-xl border border-slate-300 px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-slate-50 transition-colors"
                                placeholder="admin" />
                        </div>
                    </div>

                    <div v-if="store.error"
                        class="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg border border-red-100">
                        {{ store.error }}
                    </div>

                    <div>
                        <button type="submit" :disabled="store.loading"
                            class="flex w-full justify-center rounded-xl border border-transparent bg-blue-600 py-3 px-4 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                            <span v-if="store.loading" class="animate-pulse">Autenticando...</span>
                            <span v-else>Entrar no Sistema</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store';

const email = ref('admin@datacrm.com');
const password = ref('admin');
const store = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
    const success = await store.login(email.value, password.value);
    if (success) {
        router.push('/');
    }
};
</script>