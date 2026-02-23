<template>
  <div class="h-full flex flex-col bg-slate-900 text-white">
    
    <div class="h-20 flex items-center px-6 shrink-0 border-b border-slate-800">
      <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 font-bold text-white shadow-lg shadow-blue-900/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      </div>
      <span class="font-bold text-lg tracking-wide">Data <span class="text-blue-500 italic">CRM</span></span>
    </div>

    <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
      <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Menu Principal</div>
      
      <router-link 
        v-for="item in menuItems" 
        :key="item.path" 
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
        :class="$route.path === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
      >
        <component :is="item.icon" class="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
        {{ item.label }}
        
        <span v-if="item.badge" class="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ item.badge }}</span>
      </router-link>
    </nav>

    <div class="p-4 border-t border-slate-800 shrink-0 bg-slate-900">
      <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group">
        <div class="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-slate-300 group-hover:bg-slate-600 group-hover:text-white transition-colors relative">
          U
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-white truncate">Usuário</div>
          <div class="text-xs text-slate-500 truncate">Administrador</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  Ticket, 
  Phone, 
  BarChart3, 
  BookOpen, 
  KanbanSquare, 
  Settings 
} from 'lucide-vue-next';

const menuItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Agenda', path: '/agenda', icon: Calendar },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Chats', path: '/chats', icon: MessageSquare, badge: '12' },
  { label: 'Tickets', path: '/tickets', icon: Ticket },
  { label: 'Atendimento', path: '/atendimentos', icon: Phone },
  { label: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { label: 'Base de conhecimento', path: '/kb', icon: BookOpen },
  { label: 'KanBan', path: '/kanban', icon: KanbanSquare },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
];
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569; 
}
</style>