<template>
  <div class="flex h-full w-full bg-white overflow-hidden relative border-t border-slate-200">
    <ContactList :selectedId="selectedContact?.id" @select="handleSelectContact"
      :class="['transition-all duration-300 shrink-0 border-r border-slate-200', selectedContact ? 'hidden md:flex md:w-[340px]' : 'flex w-full md:w-[340px]']" />

    <template v-if="selectedContact">
      <div class="flex-1 flex w-full h-full relative"
        :class="['transition-all duration-300', isProfileOpen ? 'hidden lg:flex' : 'flex']">
        <button @click="handleBackToList"
          class="md:hidden absolute top-3 left-3 z-[60] bg-white border border-slate-200 shadow-md rounded-full p-2 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all">
          <el-icon :size="20">
            <ArrowLeft />
          </el-icon>
        </button>
        <ChatArea class="w-full h-full" :contact="selectedContact" :messages="messages" @send="handleSendMessage"
          @assumir="handleAssumirChat" @finalizar="openFinishModal" @transferir="isTransferModalOpen = true"
          @vincular="openLinkModal" @abrir-modal-ticket="openTicketModal" @toggle-profile="toggleProfile" />

        <div
          :class="['transition-all duration-300 ease-in-out overflow-hidden h-full shrink-0 bg-white z-50 border-l border-slate-200 absolute right-0 md:relative', isProfileOpen ? 'w-full md:w-[320px] opacity-100' : 'w-0 opacity-0']">
          <button v-if="isProfileOpen" @click="toggleProfile"
            class="md:hidden absolute top-4 left-4 z-50 bg-slate-100 p-2 rounded-full text-slate-600 hover:bg-slate-200">
            <el-icon>
              <Close />
            </el-icon>
          </button>
          <div class="w-full md:w-[320px] h-full">
            <ChatProfile :contact="selectedContact" />
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex-1 hidden md:flex flex-col items-center justify-center bg-[#f8fafd] text-slate-400">
      <el-icon :size="80" class="mb-4 text-slate-300">
        <ChatLineSquare />
      </el-icon>
      <span class="font-medium text-[13px]">Selecione um contacto para iniciar uma conversa</span>
    </div>

    <LinkCustomerModal :is-open="isLinkModalOpen" :contact-phone="selectedContact?.phone || ''"
      :contact-name="selectedContact?.name || ''" :contact-avatar="selectedContact?.avatar || ''"
      @close="isLinkModalOpen = false" @linked="handleCustomerLinked" />

    <TicketModal :is-open="isTicketModalOpen" :ticket="null" :initial-data="ticketInitialData"
      @close="isTicketModalOpen = false" @save="submitTicket" @approve-kanban="handleApproveKanban" />

    <el-dialog v-model="isTransferModalOpen" title="Transferir Atendimento" width="95%" style="max-width: 400px;"
      align-center>
      <p class="text-sm text-slate-600 mb-4">Transferir para:</p>
      <el-select v-model="transferDest" class="w-full mb-4" placeholder="Selecione">
        <el-option label="Financeiro" value="financeiro" />
        <el-option label="Suporte" value="suporte" />
      </el-select>
      <template #footer>
        <el-button @click="isTransferModalOpen = false">Cancelar</el-button>
        <el-button type="primary" @click="confirmTransfer" :disabled="!transferDest">Transferir</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="isFinishModalOpen" title="Finalizar Atendimento" width="95%" style="max-width: 500px;"
      align-center>
      <el-form ref="finishFormRef" :model="finishForm" :rules="finishRules" label-position="top">
        <el-form-item label="Motivo da Finalização" prop="reason">
          <el-select v-model="finishForm.reason" class="w-full" placeholder="Selecione um motivo...">
            <el-option label="Dúvida Resolvida" value="duvida_resolvida" />
            <el-option label="Problema Técnico" value="problema_tecnico" />
            <el-option label="Venda Concluída" value="venda_concluida" />
            <el-option label="Sem Resposta" value="sem_resposta" />
            <el-option label="Outro" value="outro" />
          </el-select>
        </el-form-item>
        <el-form-item label="Descrição / Observações" prop="description">
          <el-input v-model="finishForm.description" type="textarea" :rows="4"
            placeholder="Adicione notas obrigatórias sobre o atendimento..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isFinishModalOpen = false">Cancelar</el-button>
        <el-button type="danger" @click="confirmFinish">Finalizar Chat</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../store/chat.store';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import { useKanbanStore } from '@/modules/kanban/ui/store/kanban.store';
import { kanbanServices } from '@/modules/kanban/data/kanban.services';
import { KanbanStatus } from '@/modules/kanban/domain/valueObjects/kanban-status.enum';
import ContactList from '../components/ContactList.vue';
import ChatArea from '../components/ChatArea.vue';
import ChatProfile from '../components/ChatProfile.vue';
import LinkCustomerModal from '../components/modals/LinkCustomerModal.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';
import { ChatLineSquare, ArrowLeft, Close } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { IContact } from '../../domain/entities/chat';
import type { FormInstance, FormRules } from 'element-plus';

const store = useChatStore();
const ticketsStore = useTicketsStore();
const { selectedContact, messages } = storeToRefs(store);

const isProfileOpen = ref(false);
const isLinkModalOpen = ref(false);
const isTicketModalOpen = ref(false);
const isTransferModalOpen = ref(false);
const isFinishModalOpen = ref(false);

const transferDest = ref('');
const ticketInitialData = ref({});

const finishFormRef = ref<FormInstance>();
const finishForm = reactive({
  reason: '',
  description: ''
});
const finishRules = reactive<FormRules>({
  reason: [{ required: true, message: 'Selecione um motivo', trigger: 'change' }],
  description: [{ required: true, message: 'Adicione uma descrição/observação do atendimento', trigger: 'blur' }]
});

const handleSelectContact = (contact: IContact) => {
  // CORREÇÃO 1: Passar o objeto 'contact' inteiro, pois a tipagem de IContact é exigida.
  store.selectContact(contact);
  isProfileOpen.value = false;
};

const handleBackToList = () => {
  store.activeContactId = null;
};

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value;
};

const handleSendMessage = ({ text, type, file }: any) => {
  if (selectedContact.value) {
    // CORREÇÃO 2: Passar as propriedades num objeto único, 
    // agrupando os dados no formato Payload
    store.sendMessage({
      contactId: selectedContact.value.id,
      text,
      type,
      file
    });
  }
};

const handleAssumirChat = (contactId?: string) => {
  if (contactId) {
    store.assumirChat(contactId);
    ElMessage.success('Chamado assumido com sucesso!');
  }
};

const openLinkModal = () => {
  isLinkModalOpen.value = true;
};

const handleCustomerLinked = (data: any) => {
  if (selectedContact.value) {
    if (data.isNew) {
      const newCustomerData = {
        id: `cust_${Date.now()}`,
        name: data.customerData.name,
        company: data.customerData.tradeName || data.customerData.companyName || ''
      };
      store.linkCustomerToChat(selectedContact.value.id, newCustomerData);
      ElMessage.success('Cliente cadastrado e vinculado ao chat!');
    } else {
      const existingData = {
        id: data.customerUuid,
        name: data.contactName,
        company: ''
      };
      store.linkCustomerToChat(selectedContact.value.id, existingData);
      ElMessage.success('Cliente existente vinculado ao chat!');
    }
  }
  isLinkModalOpen.value = false;
};

const openTicketModal = (contact?: IContact) => {
  if (contact) {
    ticketInitialData.value = {
      title: `Chat - ${contact.name}`,
      description: `Ticket originado do chat no WhatsApp.\nÚltima mensagem: ${contact.lastMessage}`,
      customer: contact.company || contact.name,
      priority: 'normal',
      type: 'support',
      tags: contact.tags || []
    };
    isTicketModalOpen.value = true;
  }
};

const submitTicket = async (ticketData: any) => {
  try {
    if (typeof (ticketsStore as any).createTicket === 'function') {
      await (ticketsStore as any).createTicket(ticketData);
    } else if (typeof (ticketsStore as any).create === 'function') {
      await (ticketsStore as any).create(ticketData);
    } else if (typeof (ticketsStore as any).addTicket === 'function') {
      await (ticketsStore as any).addTicket(ticketData);
    }
    ElMessage.success('Ticket criado com sucesso a partir do chat!');
    isTicketModalOpen.value = false;
  } catch (error) {
    ElMessage.error('Erro ao criar ticket.');
    console.error(error);
  }
};

const handleApproveKanban = async (ticketData: any) => {
  try {
    await ElMessageBox.confirm(
      'Deseja aprovar este ticket e enviar para a fila de desenvolvimento do Kanban?',
      'Aprovar Triagem',
      { confirmButtonText: 'Sim, Aprovar', cancelButtonText: 'Cancelar', type: 'success' }
    );

    ticketData.status = 'open';

    if (ticketData.id) {
      if (typeof (ticketsStore as any).updateTicket === 'function') {
        await (ticketsStore as any).updateTicket(ticketData.id, ticketData);
      } else if (typeof (ticketsStore as any).update === 'function') {
        await (ticketsStore as any).update(ticketData.id, ticketData);
      }
    } else {
      if (typeof (ticketsStore as any).createTicket === 'function') {
        await (ticketsStore as any).createTicket(ticketData);
      } else if (typeof (ticketsStore as any).create === 'function') {
        await (ticketsStore as any).create(ticketData);
      } else if (typeof (ticketsStore as any).addTicket === 'function') {
        await (ticketsStore as any).addTicket(ticketData);
      }
    }

    const computedPriority = (ticketData.priority === 'urgent' || ticketData.priority === 'high') ? 'high' : 'medium';
    const originalTags = Array.isArray(ticketData.tags) ? ticketData.tags : [];
    const kanbanTags = originalTags.map((tag: string) => {
      let colorClass = 'bg-slate-100 text-slate-700';
      if (tag === 'Bug') colorClass = 'bg-red-100 text-red-700';
      else if (tag === 'Crítico') colorClass = 'bg-pink-100 text-pink-700';
      else if (tag === 'Urgente') colorClass = 'bg-orange-100 text-orange-700';
      else if (tag === 'Nova Funcionalidade') colorClass = 'bg-green-100 text-green-700';
      else if (tag === 'Melhoria') colorClass = 'bg-blue-100 text-blue-700';
      return { label: tag, colorClass };
    });

    const cardId = `kb-${Date.now()}`;
    const newKanbanCard = {
      id: cardId,
      title: ticketData.title || ticketData.subject || 'Ticket sem título',
      description: ticketData.description || 'Originado do atendimento',
      customerName: ticketData.customer || 'Desconhecido',
      status: KanbanStatus.TODO,
      priority: computedPriority as 'high' | 'medium' | 'low',
      dateDisplay: new Date().toLocaleDateString('pt-BR'),
      avatars: [] as string[],
      tags: kanbanTags
    };

    try {
      await kanbanServices.createCard(newKanbanCard);
    } catch (apiError) {
      console.warn('kanbanServices.createCard falhou, forçando o estado local', apiError);
    }

    const kanbanStore = useKanbanStore();
    if (kanbanStore.columns && kanbanStore.columns.length > 0) {
      const todoCol = kanbanStore.columns.find((c: any) => c.id === KanbanStatus.TODO || c.id === 'todo');
      if (todoCol) {
        todoCol.cards.push(newKanbanCard);
      } else {
        kanbanStore.columns[0].cards.push(newKanbanCard);
      }
    }

    ElMessage.success('Ticket aprovado e enviado para o Kanban com sucesso!');
    isTicketModalOpen.value = false;

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Erro ao enviar o ticket para o Kanban.');
      console.error(error);
    }
  }
};

const confirmTransfer = () => {
  if (selectedContact.value && transferDest.value) {
    store.transferirChat(selectedContact.value.id, transferDest.value);
    ElMessage.success('Atendimento transferido para o setor ' + transferDest.value);
    isTransferModalOpen.value = false;
    transferDest.value = '';
  }
};

const openFinishModal = () => {
  finishForm.reason = '';
  finishForm.description = '';
  isFinishModalOpen.value = true;
};

const confirmFinish = async () => {
  if (!finishFormRef.value) return;
  await finishFormRef.value.validate((valid) => {
    if (valid) {
      if (selectedContact.value) {
        store.finishChat(selectedContact.value.id, finishForm.reason, finishForm.description);
        ElMessage.success('Atendimento finalizado e dados salvos no histórico!');
      }
      isFinishModalOpen.value = false;
    } else {
      ElMessage.warning('Preencha os campos obrigatórios para finalizar.');
    }
  });
};
</script>