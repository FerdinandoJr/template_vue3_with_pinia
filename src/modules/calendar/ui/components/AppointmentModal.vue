<template>
  <div 
    v-if="isOpen" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="modal-title"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="close"></div>

    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
      
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 id="modal-title" class="text-lg font-bold text-slate-800">
            {{ form.id !== 0 ? 'Editar Agendamento' : 'Novo Agendamento' }}
        </h3>
        <button @click="close" aria-label="Fechar janela" class="text-slate-400 hover:text-slate-600 transition-colors focus:ring-2 focus:ring-blue-500 rounded-lg p-1">&times;</button>
      </div>

      <div class="p-6 space-y-5 overflow-y-auto custom-scrollbar">
        <div class="flex gap-4">
            <div class="flex-1">
                <label for="title" class="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                <input 
                  id="title"
                  ref="titleInput"
                  v-model="form.title" 
                  type="text" 
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-700 transition-all" 
                  placeholder="Ex: Reunião Mensal"
                >
            </div>
            <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Cor</label>
                 <div class="flex gap-2 mt-1" role="radiogroup" aria-label="Escolher cor do evento">
                    <button 
                        v-for="c in colors" 
                        :key="c" 
                        role="radio"
                        :aria-checked="form.color === c"
                        :aria-label="`Cor ${c}`"
                        @click="form.color = c" 
                        class="w-9 h-9 rounded-full border-2 transition-transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                        :style="{ backgroundColor: c }" 
                        :class="form.color === c ? 'border-slate-600 scale-110' : 'border-transparent'"
                    ></button>
                 </div>
            </div>
        </div>

        <div class="relative">
            <label for="client" class="block text-xs font-bold text-slate-500 uppercase mb-1">Cliente</label>
            <div class="relative">
                <span class="absolute left-3 top-2.5 text-slate-400" aria-hidden="true">🔍</span>
                <input 
                    id="client"
                    v-model="clientSearch" 
                    @focus="showClientList = true"
                    type="text" 
                    class="w-full pl-9 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="Buscar cliente..."
                >
                <button v-if="form.clientName" @click="clearClient" aria-label="Limpar cliente" class="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-red-500 focus:outline-none">Limpar</button>
            </div>
            
            <div v-if="showClientList && filteredClients.length > 0" class="absolute z-50 w-full bg-white border border-slate-100 shadow-xl rounded-lg mt-1 max-h-48 overflow-y-auto">
                <div 
                    v-for="client in filteredClients" 
                    :key="client.id"
                    @click="selectClient(client)"
                    class="px-3 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex items-center gap-3 border-b border-slate-50 last:border-0"
                >
                    <div class="w-8 h-8 rounded bg-slate-100 text-xs font-bold flex items-center justify-center text-slate-600" aria-hidden="true">{{ client.avatar }}</div>
                    <div>
                        <div class="font-bold text-slate-800">{{ client.name }}</div>
                        <div class="text-xs text-slate-500">{{ client.company }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div class="col-span-1">
                <label for="date" class="block text-xs font-bold text-slate-400 uppercase mb-1">Data</label>
                <input id="date" v-model="form.date" type="date" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
                <label for="startTime" class="block text-xs font-bold text-slate-400 uppercase mb-1">Início</label>
                <input id="startTime" v-model="form.time" type="time" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
                <label for="endTime" class="block text-xs font-bold text-slate-400 uppercase mb-1">Fim</label>
                <input id="endTime" v-model="form.endTime" type="time" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="type" class="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
            <select id="type" v-model="form.type" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="meeting">🤝 Reunião</option>
              <option value="support">🛠️ Suporte</option>
              <option value="installation">⚙️ Instalação</option>
            </select>
          </div>
          <div>
            <label for="agent" class="block text-xs font-bold text-slate-500 uppercase mb-1">Responsável</label>
            <select id="agent" v-model="form.agent" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="Eu">Eu</option>
                <option value="Ana Silva">Ana Silva</option>
                <option value="Carlos Mendes">Carlos Mendes</option>
            </select>
          </div>
        </div>
        
        <div>
            <label for="description" class="block text-xs font-bold text-slate-500 uppercase mb-1">Notas / Descrição</label>
            <textarea id="description" v-model="form.description" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Detalhes do agendamento..."></textarea>
        </div>

      </div>

      <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
        <button 
            v-if="form.id !== 0" 
            @click="remove" 
            class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1 focus:ring-2 focus:ring-red-500 outline-none"
        >
            🗑️ Excluir
        </button>
        <div v-else></div>

        <div class="flex gap-3">
            <button @click="close" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition focus:ring-2 focus:ring-slate-500 outline-none">Cancelar</button>
            <button @click="save" class="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition transform active:scale-95 focus:ring-2 focus:ring-blue-800 outline-none focus:ring-offset-2">
                {{ form.id !== 0 ? 'Atualizar' : 'Salvar' }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed, nextTick } from 'vue';
import type { Appointment } from '../../domain/entities/Appointment';
import { useClientsStore } from '../../../clients/ui/store/clients.store';
import type { Client } from '../../../clients/domain/entities/Client';
import { useToast } from '@/core/composables/useToast';
import { AppointmentService } from '../../domain/services/AppointmentService';

const props = defineProps<{ 
    isOpen: boolean;
    editData?: Appointment;
}>();
const emit = defineEmits(['close', 'save', 'delete']);

const clientsStore = useClientsStore();
const { showToast } = useToast();

if (clientsStore.clients.length === 0) clientsStore.loadClients();

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const clientSearch = ref('');
const showClientList = ref(false);
const titleInput = ref<HTMLInputElement | null>(null);

const filteredClients = computed(() => {
    if (!clientSearch.value) return clientsStore.clients.slice(0, 5);
    return clientsStore.clients.filter(c => 
        c.name.toLowerCase().includes(clientSearch.value.toLowerCase()) || 
        c.company.toLowerCase().includes(clientSearch.value.toLowerCase())
    ).slice(0, 5);
});

const form = reactive<Appointment>({
  id: 0,
  title: '',
  clientId: 0,
  clientName: '',
  agent: 'Eu',
  date: new Date().toISOString().split('T')[0] ?? '',
  time: '09:00',
  endTime: '10:00',
  type: 'meeting',
  status: 'confirmed',
  color: '#3b82f6',
  description: ''
});

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
        close();
    }
};

watch(showClientList, (val) => {
    if (val) {
        setTimeout(() => window.addEventListener('click', closeDropdown), 0);
    } else {
        window.removeEventListener('click', closeDropdown);
    }
});
const closeDropdown = () => showClientList.value = false;

const selectClient = (client: Client) => {
    form.clientId = client.id;
    form.clientName = client.name;
    clientSearch.value = client.name;
    showClientList.value = false;
};

const clearClient = () => {
    form.clientId = 0;
    form.clientName = '';
    clientSearch.value = '';
};

watch(() => form.time, (newTime) => {
    if (newTime && form.id === 0) { 
        form.endTime = AppointmentService.getDefaultEndTime(newTime, 60);
    }
});

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    window.addEventListener('keydown', handleKeydown);
    if (props.editData) {
        Object.assign(form, props.editData);
        clientSearch.value = props.editData.clientName;
    } else {
        form.id = 0;
        form.title = '';
        form.clientId = 0;
        form.clientName = '';
        form.agent = 'Eu';
        form.description = '';
        form.color = '#3b82f6';
        form.time = '09:00';
        form.endTime = '10:00';
        clientSearch.value = '';
    }
    await nextTick();
    titleInput.value?.focus();
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
});

const close = () => emit('close');

const save = () => {
  if (!form.title) {
    showToast("O título do agendamento é obrigatório.", "error");
    titleInput.value?.focus();
    return;
  }
  if (!form.clientName) form.clientName = clientSearch.value || 'Cliente não cadastrado';
  
  emit('save', { ...form });
};

const remove = () => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        emit('delete', form.id);
        close();
    }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>