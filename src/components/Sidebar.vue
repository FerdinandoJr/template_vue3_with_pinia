<template>
  <aside class="w-64 h-screen bg-[#1e293b] text-white flex flex-col shadow-2xl fixed left-0 top-0 z-50 font-sans border-r border-white/5">
    
    <div class="h-20 flex items-center px-8 border-b border-white/5">
      <div class="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
      </div>
      <h1 class="text-xl font-black tracking-tight italic">Data <span class="text-blue-500 font-light">CRM</span></h1>
    </div>
    
    <nav class="flex-1 py-8 overflow-y-auto custom-scrollbar">
      <div class="px-4 mb-4">
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">Menu Principal</p>
        <ul class="space-y-1.5">
          <li v-for="item in menuItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:text-white hover:bg-white/5"
              active-class="!bg-blue-600 !text-white shadow-lg shadow-blue-900/40"
            >
              <component 
                :is="item.icon" 
                class="w-5 h-5 flex-shrink-0"
              />
              
              <span class="text-sm font-bold tracking-tight">{{ item.label }}</span>

              <span 
                v-if="item.badge" 
                class="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
                :class="$route.path === item.path ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'"
              >
                {{ item.badge }}
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <div class="p-4 bg-[#1a2232] border-t border-white/5">
      <div class="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
        <div class="relative">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-black shadow-inner border border-white/10">
            U
          </div>
          <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#1a2232] rounded-full shadow-sm"></div>
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-black text-white truncate tracking-tight group-hover:text-blue-400 transition-colors">Usuário</p>
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Administrador</p>
        </div>
        <button class="ml-auto text-slate-500 hover:text-red-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'

const IconDashboard = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('rect', { x: '3', y: '3', width: '7', height: '9' }), h('rect', { x: '14', y: '3', width: '7', height: '5' }), h('rect', { x: '14', y: '12', width: '7', height: '9' }), h('rect', { x: '3', y: '16', width: '7', height: '5' })])
const IconAgenda = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }), h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }), h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }), h('line', { x1: '3', y1: '10', x2: '21', y2: '10' })])
const IconUsers = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }), h('circle', { cx: '9', cy: '7', r: '4' }), h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })])
const IconChat = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('path', { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' })])
const IconPhone = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })])
const IconReport = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('line', { x1: '18', y1: '20', x2: '18', y2: '10' }), h('line', { x1: '12', y1: '20', x2: '12', y2: '4' }), h('line', { x1: '6', y1: '20', x2: '6', y2: '14' })])
const IconKB = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }), h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' })])
const IconKanban = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }), h('line', { x1: '9', y1: '3', x2: '9', y2: '21' }), h('line', { x1: '15', y1: '3', x2: '15', y2: '21' })])
const IconSettings = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }, [h('circle', { cx: '12', cy: '12', r: '3' }), h('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })])

const menuItems = ref([
  { label: 'Dashboard', path: '/', icon: IconDashboard },
  { label: 'Agenda', path: '/agenda', icon: IconAgenda },
  { label: 'Clientes', path: '/clientes', icon: IconUsers },
  { label: 'Chats', path: '/chats', icon: IconChat, badge: '12' },
  { label: 'Atendimento', path: '/atendimentos', icon: IconPhone },
  { label: 'Relatórios', path: '/relatorios', icon: IconReport },
  { label: 'Base de conhecimento', path: '/kb', icon: IconKB },
  { label: 'KanBan', path: '/kanban', icon: IconKanban },
  { label: 'Configurações', path: '/configuracoes', icon: IconSettings },
])
</script>