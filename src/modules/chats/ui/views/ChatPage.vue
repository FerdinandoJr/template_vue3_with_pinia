<template>
  <div class="flex h-full w-full bg-white overflow-hidden relative">
    
    <ContactList 
      :selectedId="selectedContact?.id" 
      @select="handleSelectContact" 
    />

    <template v-if="selectedContact">
      <ChatArea 
        :contact="selectedContact" 
        :messages="messages" 
        @send="store.sendMessage"
        @assumir="store.assumirChat"
        @finalizar="openFinishModal"
        @transferir="isTransferModalOpen = true"
        @adicionar="openEditContactModal"
        @abrir-modal-ticket="openTicketModal"
        @toggle-profile="isProfileOpen = !isProfileOpen"
      />
      
      <div 
        :class="[
          'transition-all duration-300 ease-in-out overflow-hidden h-full shrink-0 bg-white z-20',
          isProfileOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
        ]"
      >
        <div class="w-[320px] h-full">
          <ChatProfile :contact="selectedContact" />
        </div>
      </div>
    </template>

    <div v-else class="flex-1 flex flex-col items-center justify-center bg-[#f8fafd]">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 mb-4">
        <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5Z"></path>
        <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
      </svg>
      <span class="text-slate-500 font-medium text-[13px]">
        Selecione um contato para iniciar uma conversa
      </span>
    </div>

    <div v-if="isTransferModalOpen" class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-[400px] p-6 shadow-xl border border-slate-200">
        <h3 class="font-bold text-slate-800 text-lg mb-4">Transferir Atendimento</h3>
        <p class="text-sm text-slate-500 mb-4">Selecione o setor ou atendente para transferir a conversa atual.</p>
        <select class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 outline-none mb-6">
          <option>Suporte Nível 2</option>
          <option>Financeiro</option>
          <option>Comercial</option>
        </select>
        <div class="flex justify-end gap-3">
          <button @click="isTransferModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
          <button @click="submitTransfer" class="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Transferir Agora</button>
        </div>
      </div>
    </div>

    <div v-if="isFinishModalOpen" class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-[600px] p-6 shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
        <div class="flex justify-between items-center mb-5">
          <h3 class="font-bold text-slate-800 text-lg">Finalizar Atendimento</h3>
          <button @click="isFinishModalOpen = false" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        <div class="overflow-y-auto custom-scrollbar pr-2 space-y-4">
          <div>
            <div :class="['rounded-t-md overflow-hidden flex flex-col transition-colors', finishFormError ? 'border-2 border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.2)]' : 'border border-slate-300']">
              <textarea v-model="finishForm.description" @input="finishFormError = false" rows="5" placeholder="Descreva obrigatoriamente o que foi resolvido neste chamado..." class="w-full bg-white p-4 text-[14px] text-slate-700 outline-none resize-y min-h-[140px] placeholder:text-slate-400"></textarea>
            </div>
            <div v-if="finishFormError" class="mt-2 flex items-center gap-1.5 text-red-500 text-[12px] font-bold animate-pulse">
              <span>O preenchimento do resumo é obrigatório para finalizar o atendimento.</span>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 shrink-0">
          <button @click="isFinishModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
          <button @click="submitFinish" class="px-6 py-2.5 bg-[#2563eb] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Finalizar Atendimento</button>
        </div>
      </div>
    </div>

    <div v-if="isEditModalOpen" class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl w-[450px] p-6 shadow-xl border border-slate-200">
        <h3 class="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          Adicionar Contato
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-[11px] font-black uppercase text-slate-400 mb-1">WhatsApp</label>
            <input type="text" disabled :value="selectedContact?.phone" class="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 outline-none cursor-not-allowed" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase text-slate-400 mb-1">Nome</label>
            <input v-model="editContactForm.name" type="text" placeholder="Ex: Carlos Silva" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-[11px] font-black uppercase text-slate-400 mb-1">Empresa</label>
            <input v-model="editContactForm.company" type="text" placeholder="Ex: Tech Solutions" class="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500" />
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button @click="isEditModalOpen = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
          <button @click="submitEditContact" class="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Salvar</button>
        </div>
      </div>
    </div>

    <div v-if="isTicketModalOpen" class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-xl border border-slate-200">
        
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
          <div class="w-full">
            <input 
              v-model="ticketForm.title" 
              type="text" 
              class="w-full text-2xl font-bold text-slate-800 outline-none placeholder:text-slate-300 border-b border-transparent focus:border-blue-500 transition-colors pb-1"
              placeholder="Digite o título do Ticket..."
            />
          </div>
          <button @click="isTicketModalOpen = false" class="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-4">&times;</button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          <div class="flex flex-wrap gap-2">
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors">
              <span class="text-lg leading-none">+</span> Adicionar
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> Checklist
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Membros
            </button>
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> Anexo
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-2">Etiquetas</label>
              <div class="flex items-center gap-2">
                <div class="bg-[#4ade80] text-[#064e3b] px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 truncate">
                  <span class="w-2.5 h-2.5 bg-[#064e3b]/30 rounded-sm shrink-0"></span>
                  {{ ticketForm.tag }}
                </div>
                <button class="w-8 h-8 shrink-0 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 flex items-center justify-center font-bold">+</button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-2">Datas</label>
              <input 
                v-model="ticketForm.date"
                type="text" 
                class="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-2">Coluna do Kanban</label>
              <select 
                v-model="ticketForm.status"
                class="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
              >
                <option :value="KanbanStatus.TODO">A Fazer</option>
                <option :value="KanbanStatus.IN_PROGRESS">Em Progresso</option>
                <option :value="KanbanStatus.REVIEW">Em Revisão</option>
                <option :value="KanbanStatus.DONE">Concluído</option>
              </select>
            </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              <label class="font-bold text-slate-800">Descrição</label>
            </div>
            <textarea 
              v-model="ticketForm.description" 
              rows="8" 
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-y"
              placeholder="Descreva o que precisa ser feito..."
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
          <button @click="isTicketModalOpen = false" class="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
          <button @click="submitTicket" class="px-6 py-2.5 bg-[#1a56db] text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">Criar Ticket no Kanban</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../store/chat.store';
import { MessageType } from '../../domain/valueObjects/chat-enums';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';
import { KanbanStatus } from '@/modules/kanban/domain/valueObjects/kanban-status.enum';

import ContactList from '../components/ContactList.vue';
import ChatArea from '../components/ChatArea.vue';
import ChatProfile from '../components/ChatProfile.vue';

const store = useChatStore();
const kanbanStore = useKanbanStore();
const { messages, selectedContact } = storeToRefs(store);
const isTransferModalOpen = ref(false);
const isFinishModalOpen = ref(false);
const isEditModalOpen = ref(false); 
const isProfileOpen = ref(false); 
const isTicketModalOpen = ref(false);
const finishForm = ref({ description: '', files: [] as File[] });
const finishFormError = ref(false);
const editContactForm = ref({ name: '', company: '' });

const ticketForm = ref({
  title: '',
  description: '',
  date: '',
  tag: 'Suporte / Dúvida',
  status: KanbanStatus.TODO
});

onMounted(() => {
  store.fetchContacts();
});

const handleSelectContact = (contact: any) => {
  isProfileOpen.value = false; 
  store.selectContact(contact);
};

const openFinishModal = () => {
  finishForm.value = { description: '', files: [] };
  finishFormError.value = false;
  isFinishModalOpen.value = true;
};

const submitFinish = () => {
  if (selectedContact.value) {
    if (!finishForm.value.description.trim()) {
      finishFormError.value = true;
      return; 
    }
    store.finalizarChat(selectedContact.value.id, { 
      description: finishForm.value.description, 
      files: finishForm.value.files 
    });
    isFinishModalOpen.value = false;
  }
};

const submitTransfer = () => {
  if (selectedContact.value) {
    store.transferirChat(selectedContact.value.id);
    isTransferModalOpen.value = false;
  }
};

const openEditContactModal = () => {
  if (selectedContact.value) {
    editContactForm.value = {
      name: selectedContact.value.name.includes('+') ? '' : selectedContact.value.name,
      company: selectedContact.value.company || ''
    };
    isEditModalOpen.value = true;
  }
};

const submitEditContact = () => {
  if (selectedContact.value && editContactForm.value.name) {
    const newAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(editContactForm.value.name)}&background=2563eb&color=fff`;
    
    store.updateContact(selectedContact.value.id, {
      name: editContactForm.value.name,
      company: editContactForm.value.company,
      avatar: newAvatar
    });
    
    store.messages.push({
      id: Date.now().toString(),
      text: `✏️ Contato adicionado: ${editContactForm.value.name} (${editContactForm.value.company || 'Sem empresa'})`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isMine: false,
      type: MessageType.ALERT
    });

    isEditModalOpen.value = false;
  }
};

const openTicketModal = (contact: any) => {
  const today = new Date().toLocaleDateString('pt-BR');
  
  ticketForm.value = {
    title: `Atendimento: ${contact.company || contact.name}`,
    description: `Solicitação via WhatsApp.\n\nÚltima mensagem enviada:\n"${contact.lastMessage}"\n\n---\nDetalhar a solicitação aqui:`,
    date: `${today} - Prazo a definir`,
    tag: 'Atendimento',
    status: KanbanStatus.TODO
  };
  
  isTicketModalOpen.value = true;
};

const submitTicket = () => {
  if (!selectedContact.value) return;

  kanbanStore.addCard({
    title: ticketForm.value.title,
    description: ticketForm.value.description,
    customerName: selectedContact.value.company || selectedContact.value.name,
    status: ticketForm.value.status, 
    avatars: ['U'], 
    tags: [
      { label: ticketForm.value.tag, colorClass: 'bg-green-100 text-green-700' }
    ],
    priority: 'medium'
  });

  // Avisa no chat
  const columnName = {
    [KanbanStatus.TODO]: 'A Fazer',
    [KanbanStatus.IN_PROGRESS]: 'Em Progresso',
    [KanbanStatus.REVIEW]: 'Em Revisão',
    [KanbanStatus.DONE]: 'Concluído'
  }[ticketForm.value.status];

  store.messages.push({
    id: Date.now().toString(),
    text: `🎫 Ticket "${ticketForm.value.title}" criado e enviado para o Kanban (Coluna: ${columnName}).`,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    isMine: true,
    type: MessageType.ALERT
  });

  isTicketModalOpen.value = false;
};
</script>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
</style>