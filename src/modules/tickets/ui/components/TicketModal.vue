<template>
  <el-dialog :model-value="isOpen" @update:model-value="!$event && handleClose()" width="95%" style="max-width: 1050px;" align-center destroy-on-close :show-close="false" :close-on-click-modal="false" class="enterprise-ticket-dialog">
    <template #header>
      <div class="flex flex-wrap lg:flex-nowrap justify-between items-center w-full px-4 lg:px-6 py-4 border-b border-slate-200 bg-white rounded-t-xl gap-4">
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 w-full">
          <div class="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest shrink-0 border border-slate-200">
            {{ headerTitle }}
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-800 leading-tight truncate max-w-xl" :title="form.title || 'Novo Chamado'">
            {{ form.title || 'Novo Chamado' }}
          </h2>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-auto">
          <el-button circle plain type="danger" class="!bg-slate-50 hover:!bg-red-50 !border-slate-200 hover:!border-red-200" @click="handleClose">
            <el-icon class="text-slate-500 hover:text-red-500">
              <Close />
            </el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <div class="flex flex-col lg:flex-row h-[75vh] min-h-[500px] bg-slate-50 relative">
      <div class="flex-1 flex flex-col h-full overflow-hidden bg-white relative z-10">
        
        <el-tabs v-model="activeTab" class="enterprise-tabs px-4 lg:px-6 pt-4 shrink-0 border-b border-slate-100">
          <el-tab-pane name="main">
            <template #label>
              <span class="flex items-center gap-2 px-1">
                <el-icon><Document /></el-icon> Detalhes
              </span>
            </template>
          </el-tab-pane>

          <el-tab-pane name="chat" v-if="form.whatsappHistory && form.whatsappHistory.length > 0">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative text-emerald-600">
                <el-icon><ChatDotRound /></el-icon> Histórico do Chat
              </span>
            </template>
          </el-tab-pane>

          <el-tab-pane name="checklist">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative">
                <el-icon><Finished /></el-icon> Checklist
                <span v-if="form.checklist.length > 0" class="absolute -top-1 -right-3 w-4 h-4 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {{ form.checklist.length }}
                </span>
              </span>
            </template>
          </el-tab-pane>

          <el-tab-pane name="notes" v-if="isEditing">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative">
                <el-icon><Notebook /></el-icon> Notas Internas
                <span v-if="form.internalNotes.length > 0" class="absolute -top-1 -right-3 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                  {{ form.internalNotes.length }}
                </span>
              </span>
            </template>
          </el-tab-pane>

          <el-tab-pane name="attachments">
            <template #label>
              <span class="flex items-center gap-2 px-1 relative">
                <el-icon><Paperclip /></el-icon> Anexos
                <span v-if="form.attachments.length > 0" class="absolute -top-1 -right-3 w-4 h-4 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {{ form.attachments.length }}
                </span>
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <div class="flex-1 overflow-y-auto custom-scroll p-0 bg-[#f8fafc]">
          
          <div v-show="activeTab === 'main'" class="h-full flex flex-col p-4 lg:p-6 animate-in fade-in duration-300">
            <div class="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" :class="{ 'ring-1 ring-red-500 border-red-500 bg-red-50': formErrors.title }">
                <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <el-icon><EditPen /></el-icon> Título Breve <span class="text-red-500">*</span>
                </label>
                <el-input v-model="form.title" placeholder="Descreva em poucas palavras..." class="!text-lg font-medium enterprise-input" @input="formErrors.title = false" />
                <span v-if="formErrors.title" class="text-xs text-red-500 mt-1 block font-bold">Campo obrigatório.</span>
              </div>

              <div class="bg-white p-0 rounded-2xl border border-slate-200 shadow-sm flex flex-col" :class="{ 'ring-1 ring-red-500 border-red-500': formErrors.description }">
                <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                  <label class="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <el-icon><Document /></el-icon> Descrição Detalhada <span class="text-red-500">*</span>
                  </label>
                </div>
                <div class="p-2 flex-1">
                  <RichTextEditor 
                      v-model="form.description" 
                      placeholder="Descreva todos os detalhes, anexe prints e organize em tópicos..." 
                      @update:modelValue="formErrors.description = false" 
                  />
                </div>
                <span v-if="formErrors.description" class="text-xs text-red-500 p-2 block font-bold">A descrição é obrigatória.</span>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'chat'" class="h-full flex flex-col w-full bg-[#efeae2] relative overflow-hidden">
            <div class="absolute inset-0 opacity-[0.06] pointer-events-none" style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-repeat: repeat;"></div>
            
            <div class="flex-1 overflow-y-auto p-4 custom-scroll space-y-3 relative z-10 flex flex-col max-w-4xl mx-auto w-full">
              <div class="flex justify-center mb-4 mt-2">
                <span class="bg-white/80 text-slate-500 text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm">Histórico do Atendimento</span>
              </div>

              <div v-for="(msg, index) in form.whatsappHistory" :key="index" class="flex" :class="msg.isAgent ? 'justify-end' : 'justify-start'">
                <div class="max-w-[85%] md:max-w-[65%] p-2 rounded-lg shadow-sm relative"
                     :class="msg.isAgent ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'">
                  
                  <div v-if="!msg.isAgent" class="absolute -left-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-white border-r-white"></div>
                  <div v-if="msg.isAgent" class="absolute -right-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-[#d9fdd3] border-l-[#d9fdd3]"></div>

                  <div v-if="!msg.isAgent" class="text-[11px] font-black text-emerald-600 mb-0.5 px-1 tracking-tight">
                    {{ msg.sender || form.customer }}
                  </div>
                  
                  <div class="text-[14px] text-[#111b21] leading-relaxed px-1 pb-3 whitespace-pre-wrap font-medium">
                    {{ msg.text }}
                  </div>
                  
                  <div class="text-[10px] text-slate-400 absolute bottom-1 right-2 flex items-center gap-1 font-bold">
                    {{ msg.time }}
                    <el-icon v-if="msg.isAgent" class="text-blue-500 text-[12px]"><Check /></el-icon>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-3 bg-[#f0f2f5] border-t border-slate-200 flex items-center justify-center relative z-10 text-xs font-bold text-slate-400 gap-2">
              <el-icon><Lock /></el-icon> O histórico da conversa importada não pode ser alterado.
            </div>
          </div>

          <div v-show="activeTab === 'checklist'" class="h-full flex flex-col p-4 lg:p-6 animate-in fade-in duration-300">
            <div class="max-w-4xl mx-auto w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
              <div class="mb-6 border-b border-slate-100 pb-4">
                <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
                  <el-icon class="text-blue-500"><Finished /></el-icon> Tarefas e Sub-itens
                </h3>
                <p class="text-xs font-medium text-slate-500 mt-1">Gerencie os passos necessários para a conclusão deste ticket.</p>
              </div>
              
              <TicketChecklist v-model:items="form.checklist" :readonly="false" class="w-full" />
            </div>
          </div>

          <div v-show="activeTab === 'notes'" class="h-full flex flex-col p-4 lg:p-6">
            <div class="h-full flex flex-col max-w-4xl mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div class="p-3 border-b border-slate-100 bg-amber-50/50 flex items-center gap-2">
                <el-icon class="text-amber-500 text-lg"><Notebook /></el-icon>
                <span class="text-xs font-bold text-amber-700">Área restrita. O cliente não visualiza as notas adicionadas aqui.</span>
              </div>
              
              <div class="flex-1 overflow-y-auto p-4 custom-scroll space-y-4 bg-slate-50/50">
                <div v-for="(note, index) in form.internalNotes" :key="index" class="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                  <el-avatar :size="32" class="bg-amber-500 text-white shrink-0 font-bold shadow-sm">
                    {{ note.sender.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <div class="flex flex-col items-end">
                    <div class="flex items-center gap-2 mb-1 px-1">
                      <span class="text-xs font-bold text-slate-700">{{ note.sender }}</span>
                      <span class="text-[10px] font-black text-slate-400">{{ note.time }}</span>
                    </div>
                    <div class="p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm bg-amber-100/50 border border-amber-200 text-amber-900 rounded-tr-none font-medium">
                      {{ note.text }}
                    </div>
                  </div>
                </div>

                <div v-if="form.internalNotes.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                  <el-icon class="text-5xl opacity-50"><EditPen /></el-icon>
                  <p class="font-medium text-sm">Nenhuma nota interna registrada.</p>
                </div>
              </div>

              <div class="p-3 bg-white border-t border-slate-200">
                <div class="flex gap-2 items-end">
                  <el-input v-model="newNoteMessage" type="textarea" :rows="2" placeholder="Adicionar uma nota de resolução interna..." class="custom-transparent-select" resize="none" @keyup.enter.prevent="addInternalNote" />
                  <el-button type="warning" circle class="mb-1 !w-10 !h-10 !bg-amber-500 hover:!bg-amber-600 !border-none shadow-md" @click="addInternalNote" :disabled="!newNoteMessage.trim()">
                    <el-icon><Position /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'attachments'" class="p-4 lg:p-6 animate-in fade-in duration-300">
            <div class="max-w-4xl mx-auto w-full">
              <div class="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors mb-6 group" @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleFileDrop">
                <el-icon class="text-4xl text-blue-400 mb-3 group-hover:scale-110 transition-transform"><UploadFilled /></el-icon>
                <h3 class="font-bold text-slate-700 mb-1">Clique para anexar ou arraste arquivos</h3>
                <p class="text-xs text-slate-500 font-medium">Suporta PDF, Imagens, Logs (Max 10MB)</p>
                <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelected" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" v-if="form.attachments.length > 0">
                <div v-for="(file, idx) in form.attachments" :key="idx" class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors group">
                  <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <el-icon class="text-slate-500 text-lg"><Document /></el-icon>
                    </div>
                    <div class="truncate">
                      <p class="text-sm font-bold text-slate-700 truncate">{{ file.name }}</p>
                      <p class="text-[10px] text-slate-400 font-black tracking-wider uppercase">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                  </div>
                  <el-button type="danger" circle plain size="small" class="opacity-0 group-hover:opacity-100 transition-opacity" @click="removeAttachment(idx)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="w-full lg:w-[340px] xl:w-[380px] bg-slate-50 border-l border-slate-200 flex flex-col h-[50vh] lg:h-full shrink-0 relative z-20">
        <div class="flex-1 overflow-y-auto custom-scroll p-4 lg:p-5">
          <el-collapse v-model="activeCollapses" class="enterprise-collapse border-none gap-4 flex flex-col">
            
            <el-collapse-item name="routing" class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/50 [&_.el-collapse-item\_\_header]:px-4 [&_.el-collapse-item\_\_wrap]:border-none">
              <template #title>
                <div class="font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 text-[11px]">
                  <el-icon><Guide /></el-icon> Roteamento & Status
                  <div v-if="formErrors.customer || formErrors.priority || formErrors.type" class="w-2 h-2 rounded-full bg-red-500 ml-2 animate-pulse"></div>
                </div>
              </template>
              <div class="p-4 space-y-4">
                <div :class="{ 'p-2 -m-2 bg-red-50 rounded-lg border border-red-200': formErrors.customer }">
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                    Cliente / Contato <span v-if="formErrors.customer" class="text-red-500">* Requerido</span>
                  </label>
                  <el-select v-model="form.customer" placeholder="Selecione o Cliente" filterable allow-create class="w-full enterprise-select" @change="formErrors.customer = false">
                    <template #prefix><el-icon><User /></el-icon></template>
                    <el-option label="João Silva" value="João Silva" />
                    <el-option label="Maria Santos" value="Maria Santos" />
                    <el-option label="Pedro Costa" value="Pedro Costa" />
                  </el-select>
                </div>

                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status / Fila</label>
                  <el-select v-model="form.status" class="w-full enterprise-select">
                    <template #prefix>
                      <div class="w-2 h-2 rounded-full" :class="getStatusColor(form.status)"></div>
                    </template>
                    
                    <el-option v-if="form.status === 'pending_approval' && !hasPendingApprovalCol" value="pending_approval" label="Aprovação Pendente">
                      <div class="flex items-center gap-2 font-medium">
                        <span class="w-2 h-2 rounded-full bg-amber-500"></span> Aprovação Pendente
                      </div>
                    </el-option>

                    <el-option v-for="col in kanbanStore.columns" :key="col.id" :label="col.title" :value="col.id">
                      <div class="flex items-center gap-2 font-medium">
                        <span class="w-2 h-2 rounded-full" :class="col.color?.split(' ')[0] || 'bg-slate-400'"></span>
                        {{ col.title }}
                      </div>
                    </el-option>
                  </el-select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div :class="{ 'p-2 -m-2 bg-red-50 rounded-lg border border-red-200': formErrors.priority }">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                      Prioridade
                    </label>
                    <el-select v-model="form.priority" class="w-full enterprise-select" @change="formErrors.priority = false">
                      <el-option label="Baixa" value="low"> <span class="font-medium text-slate-500">Baixa</span> </el-option>
                      <el-option label="Média" value="medium"> <span class="font-bold text-blue-500">Média</span> </el-option>
                      <el-option label="Alta" value="high"> <span class="font-bold text-orange-500">Alta</span> </el-option>
                      <el-option label="Urgente" value="urgent"> <span class="font-black text-red-600">Urgente</span> </el-option>
                    </el-select>
                  </div>
                  <div :class="{ 'p-2 -m-2 bg-red-50 rounded-lg border border-red-200': formErrors.type }">
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
                      Categoria
                    </label>
                    <el-select v-model="form.type" class="w-full enterprise-select" @change="formErrors.type = false">
                      <el-option label="Suporte" value="support" />
                      <el-option label="Bug" value="bug" />
                      <el-option label="Melhoria" value="feature" />
                      <el-option label="Interno" value="internal" />
                    </el-select>
                  </div>
                </div>
              </div>
            </el-collapse-item>

            <el-collapse-item name="assignment" class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/50 [&_.el-collapse-item\_\_header]:px-4 [&_.el-collapse-item\_\_wrap]:border-none">
              <template #title>
                <span class="font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 text-[11px]">
                  <el-icon><Avatar /></el-icon> Equipe
                </span>
              </template>
              <div class="p-4">
                <el-select v-model="form.assignees" multiple filterable placeholder="Atribuir membros..." class="w-full enterprise-select mb-3">
                  <el-option v-for="user in teamMembers" :key="user.id" :label="user.name" :value="user.id">
                    <div class="flex items-center gap-2 font-medium">
                      <el-avatar :size="20" class="bg-slate-200 text-slate-600 text-[10px]">{{ user.name.charAt(0) }}</el-avatar>
                      <span>{{ user.name }}</span>
                    </div>
                  </el-option>
                </el-select>

                <div v-if="form.assignees.length > 0" class="flex flex-col gap-2 mt-2">
                  <div v-for="id in form.assignees" :key="id" class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <el-avatar :size="24" class="bg-blue-600 text-white font-bold text-xs">{{ getTeamMemberName(id).charAt(0) }}</el-avatar>
                    <span class="text-xs font-bold text-slate-700">{{ getTeamMemberName(id) }}</span>
                  </div>
                </div>
              </div>
            </el-collapse-item>

            <el-collapse-item name="planning" class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm [&_.el-collapse-item\_\_header]:bg-slate-50/50 [&_.el-collapse-item\_\_header]:px-4 [&_.el-collapse-item\_\_wrap]:border-none">
              <template #title>
                <span class="font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 text-[11px]">
                  <el-icon><Calendar /></el-icon> Planejamento
                </span>
              </template>
              <div class="p-4 space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Início</label>
                    <el-date-picker v-model="form.startDate" type="date" format="DD/MM/YYYY" placeholder="DD/MM" class="!w-full enterprise-input" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Entrega</label>
                    <el-date-picker v-model="form.endDate" type="date" format="DD/MM/YYYY" placeholder="DD/MM" class="!w-full enterprise-input" />
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <el-icon><Clock /></el-icon> Esforço Estimado (Horas)
                  </label>
                  <el-input-number v-model="form.estimatedHours" :min="0" :step="0.5" class="!w-full enterprise-input" />
                </div>
              </div>
            </el-collapse-item>

            <TicketTagsSelector v-model:selectedTags="form.tags" :readonly="false" class="px-2" />

          </el-collapse>
        </div>

        <div class="p-4 bg-white border-t border-slate-200 flex flex-col gap-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-30">
          
          <div v-if="props.ticket && props.ticket.status === 'pending_approval'" class="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2 mb-1">
            <el-icon class="text-amber-500 mt-0.5"><Warning /></el-icon>
            <div>
              <p class="text-xs font-bold text-amber-800">Este ticket precisa de aprovação</p>
              <p class="text-[10px] text-amber-600 mt-0.5 leading-tight">Preencha Responsável, Categoria e Prioridade antes de mover para o Kanban.</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
            <el-button @click="handleClose" size="large" class="w-full sm:flex-1 !rounded-xl !h-12 !font-bold">
              Cancelar
            </el-button>

            <template v-if="props.ticket && props.ticket.status === 'pending_approval'">
              <el-button type="warning" size="large" :loading="loading" @click="handleApproveKanban" class="w-full sm:flex-1 !rounded-xl !h-12 !font-black tracking-wide shadow-md">
                <el-icon class="mr-2"><Select /></el-icon> Aprovar ao Kanban
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="large" :loading="loading" @click="submit" class="w-full sm:flex-1 !bg-blue-600 hover:!bg-blue-700 !border-none !rounded-xl !h-12 !font-black tracking-wide shadow-md shadow-blue-200">
                <el-icon class="mr-2"><Check /></el-icon> {{ isEditing ? 'Salvar Alterações' : 'Criar Ticket' }}
              </el-button>
            </template>
          </div>

        </div>
      </div>
    </div>
  </el-dialog>
  
  <ArticleFormModal :is-open="isKbModalOpen" :article="kbArticleData" @close="isKbModalOpen = false" @save="handleSaveKbArticle" />
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Guide, EditPen, User, Select, Close, ChatDotRound, Paperclip, UploadFilled, Delete, Position, Warning, Check, Avatar, Calendar, Clock, Notebook, Lock, Finished } from '@element-plus/icons-vue';
import type { ITicket } from '../../domain/entities/Ticket';
import TicketChecklist from './TicketChecklist.vue';
import TicketTagsSelector from './TicketTagsSelector.vue';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';
import ArticleFormModal from '@/modules/kb/ui/components/ArticleFormModal.vue';
import { useKbStore } from '@/modules/kb/ui/store/kb.store';
import RichTextEditor from '@/components/RichTextEditor.vue';

const props = defineProps<{ isOpen: boolean; ticket: ITicket | null; initialData: any | null; }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'save', payload: Partial<ITicket>): void; (e: 'approve-kanban', payload: Partial<ITicket>): void; }>();

const kanbanStore = useKanbanStore() as any;

const isEditing = computed(() => !!props.ticket);
const activeTab = ref('main');
const activeCollapses = ref(['routing', 'assignment']);
const loading = ref(false);

const isKbModalOpen = ref(false);
const kbArticleData = ref<any>(null);

const fileInput = ref<HTMLInputElement | null>(null);
const newNoteMessage = ref('');

const teamMembers = [
  { id: '1', name: 'Admin (Você)' },
  { id: '2', name: 'João Atendimento' },
  { id: '3', name: 'Maria Vendas' }
];

const form = reactive({
  title: '',
  customer: '',
  description: '',
  status: 'pending_approval',
  priority: 'low',
  assignees: [] as string[],
  tags: [] as string[],
  checklist: [] as any[],
  whatsappHistory: [] as any[],
  internalNotes: [] as any[],
  attachments: [] as any[],
  startDate: null as string | Date | null,
  endDate: null as string | Date | null,
  estimatedHours: null as number | null,
  type: 'support'
});

const formErrors = reactive({
  title: false,
  description: false,
  customer: false,
  priority: false,
  type: false
});

const headerTitle = computed(() => {
  if (props.ticket && props.ticket.id) return `Ticket #${props.ticket.id}`;
  if (props.initialData?.id) return `Ticket #${props.initialData.id}`;
  return 'Novo Ticket';
});

const hasPendingApprovalCol = computed(() => {
  return kanbanStore.columns && kanbanStore.columns.some((c: any) => c.id === 'pending_approval');
});

const validateForm = () => {
  let isValid = true;
  if (!form.title || !form.title.trim()) { formErrors.title = true; isValid = false; } else { formErrors.title = false; }
  const cleanDescription = form.description ? form.description.replace(/<[^>]*>?/gm, '').trim() : '';
  if (!cleanDescription) { formErrors.description = true; isValid = false; } else { formErrors.description = false; }
  if (!form.customer) { formErrors.customer = true; isValid = false; } else { formErrors.customer = false; }
  if (!form.priority) { formErrors.priority = true; isValid = false; } else { formErrors.priority = false; }
  if (!form.type) { formErrors.type = true; isValid = false; } else { formErrors.type = false; }
  return isValid;
};

const initForm = () => {
  formErrors.title = false;
  formErrors.description = false;
  formErrors.customer = false;
  formErrors.priority = false;
  formErrors.type = false;
  
  activeTab.value = 'main';

  const sourceData = props.ticket || props.initialData;

  if (sourceData) {
    form.title = sourceData.title || '';
    form.customer = sourceData.customer || '';
    form.description = sourceData.description || '';
    
    let st = String(sourceData.status || 'pending_approval');
    if (st === 'in-progress') st = 'in_progress';
    form.status = st;

    form.priority = (sourceData.priority as unknown as string) || 'low';
    form.assignees = sourceData.assignees || [];
    form.tags = sourceData.tags || [];
    form.checklist = sourceData.checklist || [];
    form.attachments = sourceData.attachments || [];
    form.startDate = sourceData.startDate || null;
    form.endDate = sourceData.endDate || null;
    form.estimatedHours = sourceData.estimatedHours || null;
    form.type = sourceData.type || 'support';

    const incomingChats: any[] = Array.isArray(sourceData.chatHistory) ? sourceData.chatHistory : [];
    
    form.whatsappHistory = incomingChats.filter((msg: any) => !msg.isInternalNote);
    form.internalNotes = incomingChats.filter((msg: any) => msg.isInternalNote);

    if (form.whatsappHistory.length > 0) activeTab.value = 'chat';

  } else {
    form.title = '';
    form.customer = '';
    form.description = '';
    form.status = 'pending_approval';
    form.priority = 'low';
    form.assignees = [];
    form.tags = [];
    form.checklist = [];
    form.whatsappHistory = [];
    form.internalNotes = [];
    form.attachments = [];
    form.startDate = null;
    form.endDate = null;
    form.estimatedHours = null;
    form.type = 'support';
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) initForm();
}, { immediate: true });

const getTeamMemberName = (id: string) => {
  const member = teamMembers.find(m => m.id === id);
  return member ? member.name : 'User';
};

const handleClose = () => {
  emit('close');
};

const submit = async () => {
  if (!validateForm()) {
    ElMessage.warning("Por favor, verifique os campos obrigatórios em destaque vermelho.");
    if (formErrors.title || formErrors.description) { activeTab.value = 'main'; }
    if (formErrors.customer || formErrors.priority || formErrors.type) {
      if (!activeCollapses.value.includes('routing')) { activeCollapses.value.push('routing'); }
    }
    return;
  }

  loading.value = true;
  try {
    const rawPayload: any = { ...form };
    
    if (props.ticket?.id) rawPayload.id = props.ticket.id; 
    else if (props.initialData?.id) rawPayload.id = props.initialData.id;
    
    if (rawPayload.assignees && rawPayload.assignees.length > 0) {
      const firstAssignee = teamMembers.find(m => m.id === rawPayload.assignees[0]);
      if (firstAssignee) rawPayload.assigneeName = firstAssignee.name;
    } else {
      rawPayload.assigneeName = null;
    }
    
    rawPayload.chatHistory = [...form.whatsappHistory, ...form.internalNotes];
    
    if (typeof kanbanStore.saveBoard === 'function') kanbanStore.saveBoard();
    
    emit('save', rawPayload as Partial<ITicket>);
  } catch (error) {
    ElMessage.error("Erro ao salvar o ticket. Tente novamente.");
  } finally {
    loading.value = false;
  }
};

const handleApproveKanban = async () => {
  if (!validateForm()) {
    ElMessage.warning("Por favor, preencha os campos obrigatórios em Roteamento & Status antes de aprovar.");
    if (!activeCollapses.value.includes('routing')) { activeCollapses.value.push('routing'); }
    return;
  }
  const rawPayload: any = { ...form, id: props.ticket?.id };
  rawPayload.chatHistory = [...form.whatsappHistory, ...form.internalNotes];
  emit('approve-kanban', rawPayload as Partial<ITicket>);
};

const addInternalNote = () => {
  if (!newNoteMessage.value.trim()) return;
  form.internalNotes.push({
    text: newNoteMessage.value,
    sender: 'Admin (Você)',
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    isAgent: true,
    isInternalNote: true
  });
  newNoteMessage.value = '';
};

const handleSaveKbArticle = async (data: any) => {
  const kbStore = useKbStore();
  await kbStore.saveArticle(data);
  isKbModalOpen.value = false;
};

const triggerFileUpload = () => { fileInput.value?.click(); };
const handleFileDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) processFiles(files);
};
const handleFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) processFiles(target.files);
};
const processFiles = (files: FileList) => {
  const maxSizeBytes = 10 * 1024 * 1024;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > maxSizeBytes) { ElMessage.warning(`Ficheiro ${file.name} excede 10MB.`); continue; }
    form.attachments.push({ name: file.name, size: file.size, type: file.type, raw: file });
  }
};
const removeAttachment = (idx: number) => { form.attachments.splice(idx, 1); };

const getStatusColor = (status: string) => {
  if (status === 'resolved' || status === 'done') return 'bg-green-500';
  if (status === 'in_progress' || status === 'in-progress') return 'bg-blue-500';
  if (status === 'waiting' || status === 'pending_approval') return 'bg-amber-500';
  return 'bg-slate-400';
};
</script>

<style>
.enterprise-ticket-dialog .el-dialog__header { display: none !important; }
.enterprise-ticket-dialog .el-dialog__body { padding: 0 !important; }
.enterprise-tabs .el-tabs__item { font-size: 13px; color: #64748b; font-weight: 700; height: 48px; }
.enterprise-tabs .el-tabs__item.is-active { color: #3b82f6; }
.enterprise-tabs .el-tabs__active-bar { background-color: #3b82f6; height: 3px; border-radius: 3px 3px 0 0; }
.enterprise-tabs .el-tabs__nav-wrap::after { background-color: #f1f5f9; height: 1px; }
.enterprise-input .el-input__wrapper, .enterprise-select .el-select__wrapper {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: all 0.2s;
}
.enterprise-input .el-input__wrapper.is-focus, .enterprise-select .el-select__wrapper.is-focus {
  background-color: #ffffff;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}
.custom-transparent-select .el-textarea__inner {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 14px;
  color: #334155;
  resize: none;
}
.custom-transparent-select .el-textarea__inner:focus { outline: none !important; box-shadow: none !important; }
.custom-transparent-select .el-textarea__inner::placeholder { color: #94a3b8; font-weight: 500; }
.enterprise-collapse .el-collapse-item__header { font-size: 12px; color: #475569; }
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
</style>