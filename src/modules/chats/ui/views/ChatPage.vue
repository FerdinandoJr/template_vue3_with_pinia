<template>
  <div class="flex h-full w-full bg-white overflow-hidden relative border-t border-slate-200">
    <ContactList :selectedId="selectedContact?.id" @select="handleSelectContact" />

    <template v-if="selectedContact">
      <ChatArea :contact="selectedContact" :messages="messages" @send="handleSendMessage" @assumir="handleAssumirChat"
        @finalizar="openFinishModal" @transferir="isTransferModalOpen = true" @vincular="openLinkModal"
        @abrir-modal-ticket="openTicketModal" @toggle-profile="toggleProfile" />

      <div :class="[
        'transition-all duration-300 ease-in-out overflow-hidden h-full shrink-0 bg-white z-20 border-l border-slate-200',
        isProfileOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
      ]">
        <div class="w-[320px] h-full">
          <ChatProfile :contact="selectedContact" />
        </div>
      </div>
    </template>

    <div v-else class="flex-1 flex flex-col items-center justify-center bg-[#f8fafd] text-slate-400">
      <el-icon :size="80" class="mb-4 text-slate-300">
        <ChatLineSquare />
      </el-icon>
      <span class="font-medium text-[13px]">Selecione um contato para iniciar uma conversa</span>
    </div>

    <el-dialog v-model="isLinkModalOpen" title="Gestão de Identidade (CRM)" width="850px" align-center destroy-on-close
      class="rounded-lg custom-dialog">
      <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
        <el-avatar :size="50" :src="selectedContact?.avatar" class="bg-blue-100 text-blue-600 font-bold text-xl">
          {{ selectedContact?.name?.charAt(0).toUpperCase() }}
        </el-avatar>
        <div>
          <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Contato no WhatsApp</p>
          <h3 class="font-bold text-slate-800 text-lg">{{ selectedContact?.name }}</h3>
          <p class="text-sm text-slate-600 font-mono">{{ selectedContact?.phone }}</p>
        </div>
      </div>

      <el-tabs type="border-card" class="shadow-sm">
        <el-tab-pane>
          <template #label><span class="flex items-center gap-2"><el-icon>
                <Search />
              </el-icon> Vincular Existente</span></template>
          <el-form label-position="top" class="mt-4 p-4">
            <el-form-item label="Buscar Cliente na Base">
              <el-select v-model="linkForm.customerUuid" filterable remote :remote-method="remoteSearchCustomer"
                :loading="loadingSearch" class="w-full" placeholder="Digite Nome, Razão Social ou CPF/CNPJ...">
                <el-option v-for="item in searchResults" :key="item.uuid" :label="item.name" :value="item.uuid" />
              </el-select>
              <p class="text-xs text-slate-400 mt-2">Selecione um cliente já cadastrado para vincular a este número.</p>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane>
          <template #label><span class="flex items-center gap-2"><el-icon>
                <Plus />
              </el-icon> Novo Cadastro Completo</span></template>
          <el-form :model="newCustomerForm" label-position="top"
            class="mt-2 p-4 max-h-[450px] overflow-y-auto overflow-x-hidden custom-scroll">
            <div class="mb-6">
              <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                Dados da Empresa / Pessoa</h4>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="Tipo">
                    <el-radio-group v-model="newCustomerForm.type" size="default" class="w-full">
                      <el-radio-button label="PF" value="PF" />
                      <el-radio-button label="PJ" value="PJ" />
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="18">
                  <el-form-item :label="newCustomerForm.type === 'PJ' ? 'CNPJ' : 'CPF'">
                    <el-input v-model="newCustomerForm.document" placeholder="Apenas números" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="newCustomerForm.type === 'PJ' ? 'Razão Social' : 'Nome Completo'" required>
                    <el-input v-model="newCustomerForm.name" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="newCustomerForm.type === 'PJ' ? 'Nome Fantasia' : 'Apelido'">
                    <el-input v-model="newCustomerForm.tradeName" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="mb-6">
              <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                Canais de Contato</h4>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Telefone / WhatsApp (Vinculado)">
                    <el-input v-model="newCustomerForm.phone" disabled class="bg-slate-50">
                      <template #prefix><el-icon>
                          <Phone />
                        </el-icon></template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="E-mail Principal">
                    <el-input v-model="newCustomerForm.email" placeholder="email@exemplo.com">
                      <template #prefix><el-icon>
                          <Message />
                        </el-icon></template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="mb-2">
              <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                <h4 class="text-xs font-bold text-blue-600 uppercase tracking-widest">Endereço</h4>
                <span v-if="isLoadingCep" class="text-xs text-blue-500 font-medium flex items-center gap-1">
                  <el-icon class="is-loading">
                    <Loading />
                  </el-icon> Buscando...
                </span>
              </div>
              <el-row :gutter="15">
                <el-col :span="6">
                  <el-form-item label="CEP">
                    <el-input v-model="newCustomerForm.zipCode" @blur="fetchCep" placeholder="00000-000">
                      <template #append>
                        <el-button @click="fetchCep"><el-icon>
                            <Search />
                          </el-icon></el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Logradouro">
                    <el-input v-model="newCustomerForm.street" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="Número">
                    <el-input v-model="newCustomerForm.number" id="numero-input" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="15">
                <el-col :span="10">
                  <el-form-item label="Bairro">
                    <el-input v-model="newCustomerForm.neighborhood" />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="Cidade">
                    <el-input v-model="newCustomerForm.city" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="UF">
                    <el-input v-model="newCustomerForm.state" maxlength="2" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <el-button @click="isLinkModalOpen = false">Cancelar</el-button>
          <el-button type="primary" @click="submitCRMAction" :loading="loadingSubmit" class="!font-bold">
            Confirmar e Vincular
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="isTicketModalOpen" width="1000px" align-center destroy-on-close :show-close="false"
      class="ticket-dialog">
      <template #header>
        <div class="flex justify-between items-center w-full pr-4 pb-2 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-mono font-bold border border-blue-100">
              #NOVO-TICKET</div>
            <span class="text-slate-300">/</span>
            <div class="flex items-center gap-2 text-slate-500 text-xs font-semibold truncate max-w-[200px]">
              <el-icon>
                <User />
              </el-icon> {{ selectedContact?.name }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <el-button link @click="isTicketModalOpen = false"><el-icon class="text-lg">
                <Close />
              </el-icon></el-button>
          </div>
        </div>
      </template>

      <div class="flex gap-0 h-[700px] overflow-hidden -m-5 mt-0 bg-white">
        <div class="flex-1 flex flex-col border-r border-slate-100">
          <div class="px-6 pt-6 pb-2 shrink-0">
            <textarea v-model="ticketForm.title" rows="1"
              class="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 border-none outline-none bg-transparent resize-none focus:ring-0"
              placeholder="Título do chamado..." @input="autoResize"></textarea>
          </div>

          <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
            <el-tabs v-model="ticketActiveTab" class="px-6 custom-tabs h-full flex flex-col overflow-hidden">
              <el-tab-pane label="Descrição" name="main" class="h-full flex flex-col overflow-hidden">
                <div class="flex flex-col h-full pb-4 overflow-hidden">
                  <div
                    class="mt-4 mb-2 bg-slate-50 border border-slate-200 rounded px-2 py-1 flex items-center gap-2 shrink-0">
                    <el-button link size="small" @click="insertFormat('**', '**')"><span
                        class="font-bold">B</span></el-button>
                    <el-button link size="small" @click="insertFormat('*', '*')"><span
                        class="italic">I</span></el-button>
                    <div class="w-px h-3 bg-slate-300"></div>
                    <el-button link size="small" @click="insertFormat('\n- ', '')"><el-icon>
                        <List />
                      </el-icon></el-button>
                  </div>
                  <div class="flex-1 overflow-y-auto custom-scroll pr-1">
                    <el-input ref="descriptionInputRef" v-model="ticketForm.description" type="textarea" :rows="12"
                      placeholder="Descreva o problema detalhadamente..." class="w-full description-textarea" />

                    <div class="mt-8 mb-6">
                      <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><el-icon>
                          <List />
                        </el-icon> Checklist de Execução</h4>
                      <div class="space-y-2">
                        <div v-for="(item, index) in ticketForm.checklist" :key="index"
                          class="flex items-center gap-3 group bg-slate-50 p-2 rounded">
                          <el-checkbox v-model="item.done" />
                          <input v-model="item.text"
                            class="flex-1 bg-transparent border-none outline-none text-sm transition-all"
                            :style="item.done ? { textDecoration: 'line-through', textDecorationColor: '#10b981', textDecorationThickness: '2px', color: '#94a3b8', fontStyle: 'italic' } : {}"
                            placeholder="Nova tarefa..." />
                          <el-button link type="danger" size="small" @click="removeChecklistItem(index)"><el-icon>
                              <Delete />
                            </el-icon></el-button>
                        </div>
                        <el-button link type="primary" size="small" @click="addChecklistItem" class="mt-2">+ Adicionar
                          Tarefa</el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <el-tab-pane label="Anexos" name="files" class="h-full overflow-y-auto custom-scroll pb-4">
                <div class="mt-4">
                  <el-upload drag multiple action="#" :auto-upload="false" :on-change="handleAttachmentChange"
                    :show-file-list="false" class="w-full">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text font-sans">Arraste ou clique para anexar</div>
                  </el-upload>
                  <div class="grid grid-cols-2 gap-3 mt-6">
                    <div v-for="(file, idx) in ticketForm.attachments" :key="idx"
                      class="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm group relative overflow-hidden">
                      <div
                        class="w-10 h-10 rounded bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                        {{ file.name.split('.').pop() }}</div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-slate-700 truncate">{{ file.name }}</p>
                        <p class="text-[10px] text-slate-400">{{ (file.size / 1024).toFixed(1) }} KB</p>
                      </div>
                      <el-button link type="danger" @click="removeAttachment(idx)"><el-icon>
                          <Delete />
                        </el-icon></el-button>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <el-tab-pane label="Histórico Chat" name="chat" class="h-full flex flex-col overflow-hidden">
                <div
                  class="mt-4 flex-1 overflow-y-auto custom-scroll bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3 mb-4">
                  <div v-for="msg in ticketForm.contextMessages" :key="msg.id"
                    :class="['flex flex-col max-w-[90%]', msg.isMine ? 'items-end ml-auto' : 'items-start']">
                    <span class="text-[9px] text-slate-400 mb-1">{{ msg.isMine ? 'Atendente' : 'Cliente' }} - {{
                      msg.timestamp }}</span>
                    <div
                      :class="['p-3 rounded-lg text-sm shadow-sm', msg.isMine ? 'bg-blue-100 text-blue-900 rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none']">
                      {{ msg.text }}</div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>

        <div
          class="w-[300px] bg-slate-50 p-5 flex flex-col gap-6 border-l border-slate-200 h-full overflow-y-auto custom-scroll">
          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status</span>
            <el-select v-model="ticketForm.column" class="w-full">
              <template #prefix>
                <div :class="['w-2 h-2 rounded-full mr-2', getStatusColor(ticketForm.column)]"></div>
              </template>
              <el-option label="A Fazer" value="todo" /><el-option label="Em Progresso" value="doing" /><el-option
                label="Concluído" value="done" />
            </el-select>
          </div>

          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Responsáveis</span>
            <el-select v-model="ticketForm.assignees" multiple filterable placeholder="Adicionar..."
              class="w-full mb-3">
              <el-option v-for="user in teamMembers" :key="user.id" :label="user.name" :value="user.id" />
            </el-select>
            <div class="flex -space-x-2 overflow-hidden">
              <el-avatar v-for="uid in ticketForm.assignees" :key="uid" :size="32"
                class="border-2 border-white bg-purple-600 font-bold text-[10px]">{{ getTeamMemberName(uid).charAt(0)
                }}</el-avatar>
            </div>
          </div>

          <div>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Prioridade</span>
            <div class="flex gap-1 w-full">
              <div v-for="p in ['Low', 'Medium', 'High', 'Urgent']" :key="p" @click="ticketForm.priority = p"
                :class="['flex-1 text-center py-2 rounded text-[10px] font-bold border cursor-pointer transition', ticketForm.priority === p ? getPriorityStyle(p) : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100']">
                {{ p.charAt(0) }}</div>
            </div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</span>
              <el-popover placement="bottom-end" :width="280" trigger="click" :visible="isTagPopoverOpen">
                <template #reference><el-button size="small" circle text
                    @click="isTagPopoverOpen = !isTagPopoverOpen"><el-icon>
                      <Setting />
                    </el-icon></el-button></template>
                <div class="p-2">
                  <h4 class="text-xs font-bold text-slate-700 mb-3 pb-2 border-b">{{ editingTagId ? 'Editar Tag' :
                    'Gerenciar Tags' }}</h4>
                  <div v-if="!editingTagId" class="space-y-1 mb-4 max-h-48 overflow-y-auto custom-scroll pr-1">
                    <div v-for="tag in availableTags" :key="tag.id"
                      class="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 group">
                      <div class="flex items-center gap-2 cursor-pointer flex-1" @click="toggleTag(tag.id)">
                        <el-checkbox :model-value="ticketForm.tags.includes(tag.id)" size="small" />
                        <el-tag size="small" :type="tag.type" effect="light" class="!border-0">{{ tag.name }}</el-tag>
                      </div>
                      <div class="opacity-0 group-hover:opacity-100 flex gap-1">
                        <el-button link size="small" type="primary" @click="startEditTag(tag)"><el-icon>
                            <Edit />
                          </el-icon></el-button>
                        <el-button link type="danger" size="small" @click="deleteTag(tag.id)"><el-icon>
                            <Delete />
                          </el-icon></el-button>
                      </div>
                    </div>
                  </div>
                  <div v-if="editingTagId || availableTags.length === 0" class="mb-4">
                    <el-input v-model="newTagInput" size="small" placeholder="Nome da tag..." class="mb-2" />
                    <div class="flex items-center gap-2 mb-3">
                      <el-select v-model="newTagType" size="small" style="width: 100px">
                        <el-option value="" label="Cinza" /><el-option value="success" label="Verde" /><el-option
                          value="warning" label="Laranja" /><el-option value="danger" label="Vermelho" />
                      </el-select>
                      <el-button v-if="editingTagId" type="success" size="small" @click="saveEditTag">Salvar</el-button>
                      <el-button v-else type="primary" size="small" @click="createTag">Criar</el-button>
                    </div>
                  </div>
                  <el-button type="primary" class="w-full" size="small"
                    @click="isTagPopoverOpen = false">Concluir</el-button>
                </div>
              </el-popover>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <el-tag v-for="tagId in ticketForm.tags" :key="tagId" :type="getTagName(tagId).type" closable
                @close="toggleTag(tagId)" size="small">{{ getTagName(tagId).name }}</el-tag>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-slate-200">
            <el-button type="primary" size="large" class="w-full !font-bold shadow-lg shadow-blue-100"
              @click="submitTicket">SALVAR TICKET</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="isTransferModalOpen" title="Transferir Atendimento" width="400px" align-center>
      <p class="text-sm text-slate-600 mb-4">Transferir para:</p>
      <el-select v-model="transferDest" class="w-full mb-4" placeholder="Selecione">
        <el-option label="Financeiro" value="financeiro" /><el-option label="Suporte" value="suporte" />
      </el-select>
      <template #footer>
        <el-button @click="isTransferModalOpen = false">Cancelar</el-button>
        <el-button type="primary" @click="confirmTransfer">Confirmar</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="isFinishModalOpen" title="Finalizar Atendimento" width="500px" align-center>
      <el-form ref="finishFormRef" :model="finishForm" :rules="finishRules" label-position="top"
        require-asterisk-position="right">
        <el-form-item label="Motivo da Finalização" prop="reason">
          <el-select v-model="finishForm.reason" class="w-full" placeholder="Selecione um motivo...">
            <el-option label="Dúvida Sanada" value="ok" />
            <el-option label="Cliente não respondeu" value="no_answer" />
            <el-option label="Problema Resolvido" value="solved" />
            <el-option label="Venda Concluída" value="sale" />
          </el-select>
        </el-form-item>
        <el-form-item label="Observações Obrigatórias" prop="description">
          <el-input v-model="finishForm.description" type="textarea" :rows="4"
            placeholder="Descreva o que foi resolvido ou o status final..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isFinishModalOpen = false">Cancelar</el-button>
        <el-button type="danger" @click="submitFinish">Finalizar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../store/chat.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { ChatLineSquare, Search, Plus, User, Close, Loading, ChatDotRound, List, Delete, UploadFilled, Setting, Edit, Phone, Message } from '@element-plus/icons-vue';
import { ElMessage, type UploadFile, type FormInstance, type FormRules } from 'element-plus';

import ContactList from '../components/ContactList.vue';
import ChatArea from '../components/ChatArea.vue';
import ChatProfile from '../components/ChatProfile.vue';
import type { SendMessageDTO } from '../../domain/dto/chat.dto';

const store = useChatStore();
const customerStore = useCustomerStore();
const { messages, selectedContact } = storeToRefs(store);
const isTransferModalOpen = ref(false);
const isFinishModalOpen = ref(false);
const isLinkModalOpen = ref(false);
const isProfileOpen = ref(false);
const isTicketModalOpen = ref(false);
const ticketActiveTab = ref('main');
const loadingSearch = ref(false);
const loadingSubmit = ref(false);
const transferDest = ref('');
const finishFormRef = ref<FormInstance>();
const finishForm = reactive({
  reason: '',
  description: ''
});

const finishRules = reactive<FormRules>({
  reason: [
    { required: true, message: 'Por favor, selecione um motivo.', trigger: 'change' },
  ],
  description: [
    { required: true, message: 'A observação é obrigatória para registrar o histórico.', trigger: 'blur' },
    { min: 5, message: 'A observação deve ter pelo menos 5 caracteres.', trigger: 'blur' }
  ],
});

const openFinishModal = () => {
  finishForm.reason = '';
  finishForm.description = '';
  isFinishModalOpen.value = true;
};

const submitFinish = async () => {
  if (!finishFormRef.value) return;
  await finishFormRef.value.validate((valid) => {
    if (valid) {
      if (selectedContact.value) {
        store.finalizarChat(selectedContact.value.id);
        ElMessage.success('Atendimento finalizado com sucesso!');
        isFinishModalOpen.value = false;
      }
    } else {
      ElMessage.warning('Preencha os campos obrigatórios.');
    }
  });
};

const descriptionInputRef = ref();
const editingTagId = ref<string | null>(null);
const isTagPopoverOpen = ref(false);
const newTagInput = ref('');
const newTagType = ref('');

interface ChecklistItem { text: string; done: boolean; }
const ticketForm = reactive({
  title: '', description: '', priority: 'Medium', column: 'todo',
  assignees: [] as string[], tags: [] as string[], attachments: [] as any[],
  checklist: [] as ChecklistItem[], contextMessages: [] as any[]
});

const teamMembers = ref([
  { id: '1', name: 'Você' },
  { id: '2', name: 'Atendente Alpha' },
  { id: '3', name: 'Gestor' }
]);

const availableTags = ref([
  { id: 't1', name: 'Financeiro', type: 'success' },
  { id: 't2', name: 'Urgente', type: 'danger' }
]);

const openTicketModal = () => {
  ticketForm.title = `Atendimento: ${selectedContact.value?.name}`;
  ticketForm.description = '';
  ticketForm.checklist = [];
  ticketForm.assignees = ['1'];
  ticketForm.tags = [];
  ticketForm.attachments = [];
  ticketActiveTab.value = 'main';
  if (messages.value) {
    ticketForm.contextMessages = messages.value.map((m: any) => ({ id: m.id, text: m.text, isMine: m.isMine, timestamp: m.timestamp }));
  }
  isTicketModalOpen.value = true;
};

const autoResize = (e: Event) => {
  const el = e.target as HTMLTextAreaElement;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
};

const insertFormat = (pre: string, pos: string) => {
  const txt = ticketForm.description;
  const input = descriptionInputRef.value?.textarea;
  if (!input) return;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  ticketForm.description = txt.substring(0, start) + pre + txt.substring(start, end) + pos + txt.substring(end);
};

const handleAttachmentChange = (file: UploadFile) => ticketForm.attachments.push({ name: file.name, size: file.size || 0, raw: file.raw });
const removeAttachment = (idx: number) => ticketForm.attachments.splice(idx, 1);
const toggleTag = (id: string) => { const idx = ticketForm.tags.indexOf(id); if (idx === -1) ticketForm.tags.push(id); else ticketForm.tags.splice(idx, 1); };
const createTag = () => { if (!newTagInput.value) return; const id = `t${Date.now()}`; availableTags.value.push({ id, name: newTagInput.value, type: newTagType.value }); newTagInput.value = ''; };
const startEditTag = (tag: any) => { editingTagId.value = tag.id; newTagInput.value = tag.name; newTagType.value = tag.type; };
const saveEditTag = () => { const tag = availableTags.value.find(t => t.id === editingTagId.value); if (tag) { tag.name = newTagInput.value; tag.type = newTagType.value; } cancelEditTag(); };
const cancelEditTag = () => { editingTagId.value = null; newTagInput.value = ''; };
const deleteTag = (id: string) => { availableTags.value = availableTags.value.filter(t => t.id !== id); ticketForm.tags = ticketForm.tags.filter(tid => tid !== id); };
const getTagName = (id: string) => availableTags.value.find(t => t.id === id) || { name: '?', type: 'info' };
const getTeamMemberName = (id: string) => teamMembers.value.find(u => u.id === id)?.name || '?';
const getStatusColor = (s: string) => ({ todo: 'bg-slate-400', doing: 'bg-blue-500', done: 'bg-green-500' }[s] || 'bg-slate-400');
const getPriorityStyle = (p: string) => ({ Low: 'bg-slate-50 text-slate-500', Medium: 'bg-blue-50 text-blue-600', High: 'bg-orange-50 text-orange-600', Urgent: 'bg-red-50 text-red-600' }[p] || '');
const addChecklistItem = () => ticketForm.checklist.push({ text: '', done: false });
const removeChecklistItem = (idx: number) => ticketForm.checklist.splice(idx, 1);

const submitTicket = () => {
  if (!ticketForm.title) return ElMessage.warning('Título obrigatório');
  isTicketModalOpen.value = false;
  ElMessage.success('Ticket Criado!');
};

const linkForm = reactive({ customerUuid: '' });
const searchResults = ref<any[]>([]);
const newCustomerForm = reactive({
  type: 'PF', document: '', name: '', tradeName: '',
  phone: '', email: '', zipCode: '', street: '', number: '',
  neighborhood: '', city: '', state: ''
});

const isLoadingCep = ref(false);
const fetchCep = async () => {
  const cleanCep = newCustomerForm.zipCode?.replace(/\D/g, '') || '';
  if (cleanCep.length === 8) {
    isLoadingCep.value = true;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        newCustomerForm.street = data.logradouro;
        newCustomerForm.neighborhood = data.bairro;
        newCustomerForm.city = data.localidade;
        newCustomerForm.state = data.uf;
        setTimeout(() => document.getElementById('numero-input')?.focus(), 100);
      } else {
        ElMessage.warning('CEP não encontrado.');
      }
    } catch (error) {
      ElMessage.error('Erro ao buscar CEP.');
    } finally {
      isLoadingCep.value = false;
    }
  }
};

const openLinkModal = () => {
  if (!selectedContact.value) return;
  newCustomerForm.phone = selectedContact.value.phone;
  newCustomerForm.name = selectedContact.value.name === selectedContact.value.phone ? '' : selectedContact.value.name;
  newCustomerForm.tradeName = '';
  newCustomerForm.document = '';
  newCustomerForm.email = '';
  newCustomerForm.zipCode = '';
  newCustomerForm.street = '';
  newCustomerForm.number = '';
  newCustomerForm.neighborhood = '';
  newCustomerForm.city = '';
  newCustomerForm.state = '';
  isLinkModalOpen.value = true;
};

const remoteSearchCustomer = (q: string) => {
  if (q) {
    loadingSearch.value = true;
    setTimeout(() => {
      searchResults.value = [{ uuid: '1', name: 'Cliente Mock', document: '000' }];
      loadingSearch.value = false;
    }, 500);
  }
};

const submitCRMAction = async () => {
  if (!selectedContact.value) return;
  loadingSubmit.value = true;
  try {
    let customerId = linkForm.customerUuid;
    let customerName = '';
    let customerCompany = '';

    if (!customerId) {
      if (!newCustomerForm.name) {
        ElMessage.warning('O nome é obrigatório.');
        loadingSubmit.value = false;
        return;
      }
      const newCustomerData = {
        name: newCustomerForm.name,
        companyName: newCustomerForm.type === 'PJ' ? newCustomerForm.name : '',
        tradeName: newCustomerForm.tradeName,
        document: newCustomerForm.document,
        email: newCustomerForm.email,
        phone: newCustomerForm.phone,
        status: 'active',
        source: 'WhatsApp',
        avatar: newCustomerForm.name.substring(0, 2).toUpperCase(),
        zipCode: newCustomerForm.zipCode,
        street: newCustomerForm.street,
        number: newCustomerForm.number,
        neighborhood: newCustomerForm.neighborhood,
        city: newCustomerForm.city,
        state: newCustomerForm.state,
        website: '',
        complement: ''
      };
      await customerStore.createCustomer(newCustomerData as any);
      const created = customerStore.items[0];
      if (created) {
        customerId = created.uuid;
        customerName = created.name;
        customerCompany = created.companyName;
      }
    } else {
      const found = searchResults.value.find(c => c.uuid === customerId);
      customerName = found?.name || 'Cliente Vinculado';
    }

    if (customerId) {
      store.linkCustomerToChat(selectedContact.value.id, {
        id: customerId,
        name: customerName || newCustomerForm.name,
        company: customerCompany || newCustomerForm.tradeName
      });
      ElMessage.success('Cliente vinculado com sucesso!');
      isLinkModalOpen.value = false;
    } else {
      ElMessage.error('Erro ao identificar cliente criado.');
    }
  } catch (error) {
    ElMessage.error('Erro ao vincular.');
  } finally {
    loadingSubmit.value = false;
  }
};

const toggleProfile = () => { isProfileOpen.value = !isProfileOpen.value; };

const handleSelectContact = (payload: any) => {
  if (payload && payload.id) store.selectContact(payload);
  else if (typeof payload === 'string') {
    const foundContact = store.contacts.find(c => c.id === payload);
    if (foundContact) store.selectContact(foundContact);
  }
};

const handleAssumirChat = (contactId?: string) => {
  if (contactId || selectedContact.value?.id) {
    store.assumirChat(contactId || selectedContact.value!.id);
  }
};

const handleSendMessage = (payload: Omit<SendMessageDTO, 'contactId'>) => {
  if (!selectedContact.value) return;
  const dto: SendMessageDTO = {
    contactId: selectedContact.value.id,
    text: payload.text,
    type: payload.type,
    file: payload.file
  };
  store.sendMessage(dto);
};

const confirmTransfer = () => {
  if (!selectedContact.value || !transferDest.value) return;
  store.transferirChat(selectedContact.value.id, transferDest.value);
  ElMessage.success(`Chat transferido com sucesso!`);
  isTransferModalOpen.value = false;
  transferDest.value = '';
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>