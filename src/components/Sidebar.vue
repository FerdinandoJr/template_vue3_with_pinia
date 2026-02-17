<template>
  <aside class="w-64 h-screen bg-gradient-to-b from-slate-800 to-slate-950 text-white flex flex-col shadow-2xl fixed left-0 top-0 z-50">
    <!-- Header -->
    <div class="px-6 py-8 border-b border-white/10">
      <h2 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Central de Atendimento
      </h2>
    </div>
    
    <!-- Navigation -->
    <nav class="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-white/5">
      <ul class="space-y-2">
        <li class="px-4">
          <router-link 
            to="/" 
            class="flex items-center gap-3 px-4 py-3.5 text-slate-300 rounded-lg transition-all duration-300 hover:bg-blue-500/10 hover:text-white hover:translate-x-1 font-medium"
            active-class="!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !shadow-lg !shadow-blue-500/30"
          >
            <span class="text-xl w-6 text-center">📊</span>
            <span class="text-[15px]">Dashboard</span>
          </router-link>
        </li>
        <li class="px-4">
          <router-link 
            to="/tickets" 
            class="flex items-center gap-3 px-4 py-3.5 text-slate-300 rounded-lg transition-all duration-300 hover:bg-blue-500/10 hover:text-white hover:translate-x-1 font-medium"
            active-class="!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !shadow-lg !shadow-blue-500/30"
          >
            <span class="text-xl w-6 text-center">🎫</span>
            <span class="text-[15px]">Tickets</span>
          </router-link>
        </li>
        <li class="px-4">
          <router-link 
            to="/clientes" 
            class="flex items-center gap-3 px-4 py-3.5 text-slate-300 rounded-lg transition-all duration-300 hover:bg-blue-500/10 hover:text-white hover:translate-x-1 font-medium"
            active-class="!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !shadow-lg !shadow-blue-500/30"
          >
            <span class="text-xl w-6 text-center">👥</span>
            <span class="text-[15px]">Clientes</span>
          </router-link>
        </li>
        <li class="px-4">
          <router-link 
            to="/relatorios" 
            class="flex items-center gap-3 px-4 py-3.5 text-slate-300 rounded-lg transition-all duration-300 hover:bg-blue-500/10 hover:text-white hover:translate-x-1 font-medium"
            active-class="!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !shadow-lg !shadow-blue-500/30"
          >
            <span class="text-xl w-6 text-center">📈</span>
            <span class="text-[15px]">Relatórios</span>
          </router-link>
        </li>
        <li class="px-4">
          <router-link 
            to="/configuracoes" 
            class="flex items-center gap-3 px-4 py-3.5 text-slate-300 rounded-lg transition-all duration-300 hover:bg-blue-500/10 hover:text-white hover:translate-x-1 font-medium"
            active-class="!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !shadow-lg !shadow-blue-500/30"
          >
            <span class="text-xl w-6 text-center">⚙️</span>
            <span class="text-[15px]">Configurações</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <!-- User Info Footer -->
    <div class="p-6 border-t border-white/10">
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl flex-shrink-0">
          👤
        </div>
        <div class="flex flex-col gap-1 flex-1 min-w-0">
          <span class="font-semibold text-sm truncate">Usuário</span>
          <span class="text-xs text-slate-400 truncate">Administrador</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
// Sidebar component for navigation
</script>

<style scoped>
/* Custom scrollbar for nav */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-track-white\/5::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.scrollbar-thumb-white\/10::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.scrollbar-thumb-white\/10::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
