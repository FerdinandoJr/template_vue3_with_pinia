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
          <option>Suporte Nível 2</option><option>Financeiro</option><option>Comercial</option>
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
        <h3 class="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">Adicionar Contato</h3>
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

    <div v-if="isTicketModalOpen" class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" @click="closeMenus">
      <div class="bg-white rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-xl border border-slate-200" @click.stop>
        
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
            <button @click="addChecklistItem" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg> 
              Checklist
            </button>
            
            <button @click="toggleMember" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> 
              Membros
            </button>
            
            <div class="relative">
              <button @click.stop="toggleAttachmentMenu" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> 
                Anexo
              </button>
              
              <div v-if="isAttachmentMenuOpen" class="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 p-2 flex flex-col gap-1 origin-top-left animate-in fade-in zoom-in-95 duration-200">
                <button @click="triggerDocUpload" class="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div class="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <span class="font-semibold text-slate-700 text-sm">Documento</span>
                </button>
                <button @click="triggerImageUpload" class="flex items-center gap-3 w-full text-left p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                  <span class="font-semibold text-slate-700 text-sm">Fotos e vídeos</span>
                </button>
              </div>
            </div>
            
            <input type="file" ref="docInput" class="hidden" multiple accept="*" @change="handleFileUpload" />
            <input type="file" ref="imageInput" class="hidden" multiple accept="image/*,video/*" @change="handleFileUpload" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="col-span-1 md:col-span-2">
              <label class="block text-xs font-bold text-slate-500 mb-2">Etiquetas</label>
              <div class="flex flex-wrap items-center gap-2">
                <div 
                  v-for="(tag, index) in ticketForm.tags" 
                  :key="index"
                  :class="['px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5 truncate shadow-sm', tag.color]"
                >
                  {{ tag.label }}
                  <button @click="removeTag(index)" class="hover:text-slate-900 ml-1 font-bold text-lg leading-none">&times;</button>
                </div>
                
                <div class="relative">
                  <button @click.stop="toggleTagMenu" class="w-8 h-8 shrink-0 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 flex items-center justify-center font-bold transition-colors" title="Adicionar Tag">
                    +
                  </button>
                  <div v-if="isTagMenuOpen" class="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-lg z-50 py-2 overflow-hidden">
                    <div class="px-3 pb-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 mb-1">Selecione uma etiqueta</div>
                    <button 
                      v-for="(tag, index) in availableTags" 
                      :key="index"
                      @click="addTag(tag)"
                      class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <span :class="['w-3 h-3 rounded-full', tag.color.split(' ')[0]]"></span>
                      <span class="font-medium text-slate-700">{{ tag.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-2">Data de Entrega</label>
              <input 
                v-model="ticketForm.date"
                type="date" 
                class="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
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

          <div v-if="ticketForm.members.length > 0" class="flex items-center gap-3 mt-1">
             <label class="block text-xs font-bold text-slate-500">Responsáveis:</label>
             <div class="flex -space-x-2">
                <div 
                  v-for="(member, index) in ticketForm.members" 
                  :key="index"
                  class="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm"
                >
                  {{ member }}
                </div>
              </div>
          </div>

          <div>
            <div class="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              <label class="font-bold text-slate-800">Descrição</label>
            </div>
            <textarea 
              v-model="ticketForm.description" 
              rows="6" 
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-y"
              placeholder="Descreva o que precisa ser feito..."
            ></textarea>
          </div>

          <div v-if="ticketForm.attachments.length > 0" class="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 class="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              Anexos Prontos para Envio
            </h4>
            
            <div class="flex flex-wrap gap-3">
              <div 
                v-for="(attachment, index) in ticketForm.attachments" 
                :key="index" 
                class="relative w-20 h-20 rounded-lg shrink-0 border border-slate-300 bg-white overflow-hidden group shadow-sm transition-transform hover:scale-105"
              >
                <button 
                  @click.prevent="removeAttachment(index)" 
                  class="absolute top-1 right-1 bg-slate-800/70 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                  title="Remover anexo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                
                <img 
                  v-if="attachment.file.type.startsWith('image/')" 
                  :src="attachment.url" 
                  class="w-full h-full object-cover" 
                />
                
                <div v-else class="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-100 text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span class="text-[9px] font-bold text-slate-600 truncate w-full text-center mt-2 px-1" :title="attachment.file.name">{{ attachment.file.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="ticketForm.checklists.length > 0" class="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 class="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              Tarefas (Checklist)
            </h4>
            
            <div class="space-y-2">
              <div v-for="(item, index) in ticketForm.checklists" :key="index" class="flex items-center gap-3">
                <input type="checkbox" v-model="item.done" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <input v-model="item.text" type="text" placeholder="Digite o item da tarefa..." :class="['flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-sm py-1 transition-all', item.done ? 'line-through text-slate-400' : 'text-slate-700']" />
                <button @click="removeChecklistItem(index)" class="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-slate-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <button @click="addChecklistItem" class="mt-3 text-[13px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
              <span class="text-lg leading-none">+</span> Adicionar outro item
            </button>
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
type TicketTag = { label: string; color: string };
type TicketAttachment = { file: File, url: string };

const availableTags: TicketTag[] = [
  { label: 'Atendimento', color: 'bg-green-100 text-green-700' },
  { label: 'Bug / Erro', color: 'bg-red-100 text-red-700' },
  { label: 'Financeiro', color: 'bg-amber-100 text-amber-700' },
  { label: 'Dúvida', color: 'bg-blue-100 text-blue-700' }
];

const isTagMenuOpen = ref(false);
const isAttachmentMenuOpen = ref(false);

const docInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);

const ticketForm = ref({
  title: '',
  description: '',
  date: '', 
  tags: [] as TicketTag[],
  status: KanbanStatus.TODO,
  checklists: [] as { text: string, done: boolean }[],
  attachments: [] as TicketAttachment[],
  members: ['U']
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

const closeMenus = () => {
  isTagMenuOpen.value = false;
  isAttachmentMenuOpen.value = false;
};

const toggleTagMenu = () => {
  isAttachmentMenuOpen.value = false;
  isTagMenuOpen.value = !isTagMenuOpen.value;
};

const addTag = (tag: TicketTag) => {
  const alreadyExists = ticketForm.value.tags.find(t => t.label === tag.label);
  if (!alreadyExists) {
    ticketForm.value.tags.push(tag);
  }
  isTagMenuOpen.value = false;
};

const removeTag = (index: number) => {
  ticketForm.value.tags.splice(index, 1);
};

const toggleMember = () => {
  const extraMember = 'SUP';
  if (ticketForm.value.members.includes(extraMember)) {
    ticketForm.value.members = ticketForm.value.members.filter(m => m !== extraMember);
  } else {
    ticketForm.value.members.push(extraMember);
  }
};

const addChecklistItem = () => {
  ticketForm.value.checklists.push({ text: '', done: false });
};

const removeChecklistItem = (index: number) => {
  ticketForm.value.checklists.splice(index, 1);
};

const toggleAttachmentMenu = () => {
  isTagMenuOpen.value = false;
  isAttachmentMenuOpen.value = !isAttachmentMenuOpen.value;
};

const triggerDocUpload = () => {
  isAttachmentMenuOpen.value = false;
  docInput.value?.click();
};

const triggerImageUpload = () => {
  isAttachmentMenuOpen.value = false;
  imageInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    Array.from(target.files).forEach(file => {
      const objectUrl = URL.createObjectURL(file);
      ticketForm.value.attachments.push({ file: file, url: objectUrl });
    });
    target.value = ''; 
  }
};

const removeAttachment = (index: number) => {
  const attachment = ticketForm.value.attachments[index];
  if (attachment) {
    URL.revokeObjectURL(attachment.url);
    ticketForm.value.attachments.splice(index, 1);
  }
};

const openTicketModal = (contact: any) => {
  const now = new Date();
  const todayYMD = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().substring(0, 10);
  
  const relevantMessages = messages.value.filter(
    m => m.atendimentoId === contact.currentAtendimentoId
  );

  let chatHistory = '';
  relevantMessages.forEach(m => {
    if (m.type === MessageType.ALERT) return;
    let sender = m.type === MessageType.NOTE ? '📝 Nota Interna' : (m.isMine ? '👨‍💻 Atendente' : '👤 Cliente');
    chatHistory += `[${m.timestamp}] ${sender}: ${m.text}\n`;
  });

  if (!chatHistory.trim()) {
    chatHistory = `[${contact.lastMessageTime}] 👤 Cliente: ${contact.lastMessage}`;
  }

  closeMenus();
  
  ticketForm.value.attachments.forEach(att => URL.revokeObjectURL(att.url));

  ticketForm.value = {
    title: `Atendimento: ${contact.company || contact.name}`,
    description: `Protocolo: ${contact.currentAtendimentoId || 'N/A'}\n\n--- Histórico da Conversa ---\n\n${chatHistory}\n\n---\nDetalhe a solicitação aqui: `,
    date: todayYMD,
    tags: [availableTags[0]] as TicketTag[], 
    status: KanbanStatus.TODO,
    checklists: [],
    attachments: [],
    members: ['U']
  };
  
  isTicketModalOpen.value = true;
};

const submitTicket = () => {
  if (!selectedContact.value) return;

  let finalDescription = ticketForm.value.description;

  if (ticketForm.value.date) {
    const parts = ticketForm.value.date.split('-');
    const year = parts[0] || '';
    const month = parts[1] || '';
    const day = parts[2] || '';
    if (year && month && day) {
      finalDescription += `\n\n📅 **Prazo:** ${day}/${month}/${year}`;
    }
  }

  if (ticketForm.value.checklists.length > 0) {
    finalDescription += '\n\n✅ **Checklist:**\n';
    ticketForm.value.checklists.forEach(item => {
      finalDescription += item.done ? `[X] ${item.text}\n` : `[ ] ${item.text}\n`;
    });
  }

  if (ticketForm.value.attachments.length > 0) {
    finalDescription += '\n\n📎 **Anexos:**\n';
    ticketForm.value.attachments.forEach(attachment => {
      finalDescription += `- ${attachment.file.name}\n`;
    });
  }

  const mappedTags = ticketForm.value.tags.map(t => ({
    label: t.label,
    colorClass: t.color
  }));

  kanbanStore.addCard({
    title: ticketForm.value.title,
    description: finalDescription,
    customerName: selectedContact.value.company || selectedContact.value.name,
    status: ticketForm.value.status, 
    avatars: ticketForm.value.members, 
    tags: mappedTags.length > 0 ? mappedTags : [{ label: 'Atendimento', colorClass: 'bg-slate-100 text-slate-700' }],
    priority: 'medium'
  });

  const columnName = {
    [KanbanStatus.TODO]: 'A Fazer',
    [KanbanStatus.IN_PROGRESS]: 'Em Progresso',
    [KanbanStatus.REVIEW]: 'Em Revisão',
    [KanbanStatus.DONE]: 'Concluído'
  }[ticketForm.value.status as KanbanStatus];

  store.messages.push({
    id: Date.now().toString(),
    text: `🎫 Ticket "${ticketForm.value.title}" criado e enviado para o Kanban (Coluna: ${columnName}).`,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    isMine: true,
    type: MessageType.ALERT,
    atendimentoId: selectedContact.value.currentAtendimentoId
  });

  isTicketModalOpen.value = false;
};
</script>

<style>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
</style>