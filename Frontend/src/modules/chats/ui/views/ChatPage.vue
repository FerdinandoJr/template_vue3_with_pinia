<template>
  <div class="absolute inset-0 flex flex-1 h-full min-h-0 w-full bg-white overflow-hidden border-t border-slate-200">
    
    <ContactList 
      :selectedId="selectedContact?.id" 
      @select="handleSelectContact" 
      :class="['transition-all duration-300 shrink-0 border-r border-slate-200', selectedContact ? 'hidden md:flex md:w-[340px]' : 'flex w-full md:w-[340px]']" 
    />
    
    <template v-if="selectedContact">
      <div class="flex-1 flex w-full h-full relative" :class="['transition-all duration-300', isProfileOpen ? 'hidden lg:flex' : 'flex']">
        
        <button @click="handleBackToList" class="md:hidden absolute top-3 left-3 z-[60] bg-white border border-slate-200 shadow-md rounded-full p-2 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all">
          <el-icon :size="20">
            <ArrowLeft />
          </el-icon>
        </button>

        <ChatArea 
          class="w-full h-full" 
          :contact="selectedContact" 
          :messages="messages" 
          @send="handleSendMessage" 
          @assumir="handleAssumirChat" 
          @finalizar="openFinishModal" 
          @transferir="isTransferModalOpen = true" 
          @vincular="openLinkModal" 
          @abrir-modal-ticket="openTicketModal" 
          @toggle-profile="toggleProfile" 
        />
        
        <div :class="['transition-all duration-300 ease-in-out overflow-hidden h-full shrink-0 bg-white z-50 border-l border-slate-200 absolute right-0 md:relative', isProfileOpen ? 'w-full md:w-[320px] opacity-100' : 'w-0 opacity-0']">
          <button v-if="isProfileOpen" @click="toggleProfile" class="md:hidden absolute top-4 left-4 z-50 bg-slate-100 p-2 rounded-full text-slate-600 hover:bg-slate-200">
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
    
    <div v-else class="flex-1 hidden md:flex flex-col items-center justify-center bg-[#f8fafd] text-slate-400 h-full w-full">
      <el-icon :size="80" class="mb-4 text-slate-300">
        <ChatLineSquare />
      </el-icon>
      <span class="font-medium text-[13px]">Selecione um contacto para iniciar uma conversa</span>
    </div>

    <LinkCustomerModal 
      :is-open="isLinkModalOpen" 
      :contact-phone="selectedContact?.phone || ''" 
      :contact-name="selectedContact?.name || ''" 
      :contact-avatar="selectedContact?.avatar || ''" 
      @close="isLinkModalOpen = false" 
      @linked="handleCustomerLinked" 
    />
    
    <TicketModal 
      :is-open="isTicketModalOpen" 
      :ticket="null" 
      :initial-data="ticketInitialData" 
      @close="isTicketModalOpen = false" 
      @save="submitTicket" 
      @approve-kanban="handleApproveKanban" 
    />
    
    <el-dialog v-model="isTransferModalOpen" title="Transferir Atendimento" width="95%" style="max-width: 400px;" align-center>
      <p class="text-sm text-slate-600 mb-4">Transferir para:</p>
      <el-select v-model="transferDest" class="w-full mb-4" placeholder="Selecione o setor/atendente">
        <el-option label="Financeiro" value="financeiro" />
        <el-option label="Suporte Técnico" value="suporte" />
        <el-option label="Vendas" value="vendas" />
      </el-select>
      <template #footer>
        <el-button @click="isTransferModalOpen = false" class="!font-bold">Cancelar</el-button>
        <el-button type="primary" @click="confirmTransfer" :disabled="!transferDest" class="!font-bold">Transferir</el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="isFinishModalOpen" title="Finalizar Atendimento" width="95%" style="max-width: 500px;" align-center>
      <el-form ref="finishFormRef" :model="finishForm" :rules="finishRules" label-position="top">
        <el-form-item label="Motivo da Finalização" prop="reason">
          <el-select v-model="finishForm.reason" class="w-full" placeholder="Selecione um motivo...">
            <el-option label="Dúvida Resolvida" value="duvida_resolvida" />
            <el-option label="Problema Técnico" value="problema_tecnico" />
            <el-option label="Venda Concluída" value="venda_concluida" />
            <el-option label="Sem Resposta do Cliente" value="sem_resposta" />
            <el-option label="Outro" value="outro" />
          </el-select>
        </el-form-item>
        <el-form-item label="Descrição / Observações (Obrigatório)" prop="description">
          <el-input v-model="finishForm.description" type="textarea" :rows="4" placeholder="Adicione notas sobre como este atendimento foi concluído..." resize="none" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isFinishModalOpen = false" class="!font-bold">Cancelar</el-button>
        <el-button type="danger" @click="confirmFinish" class="!font-bold">Finalizar Chat</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { ArrowLeft, Close, ChatLineSquare } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useChatStore } from '../store/chat.store';
import ContactList from '../components/ContactList.vue';
import ChatArea from '../components/ChatArea.vue';
import ChatProfile from '../components/ChatProfile.vue';
import LinkCustomerModal from '../components/modals/LinkCustomerModal.vue';
import TicketModal from '../../../tickets/ui/components/TicketModal.vue';
import type { IContact } from '../../domain/entities/chat';
import type { SendMessageDTO } from '../../domain/dto/chat.dto';

const store = useChatStore();

onMounted(() => {
  store.fetchChats();
});
const { messages } = storeToRefs(store);

const selectedContact = ref<IContact | null>(null);
const isProfileOpen = ref(false);

const isLinkModalOpen = ref(false);
const isTicketModalOpen = ref(false);
const isTransferModalOpen = ref(false);
const isFinishModalOpen = ref(false);

const transferDest = ref('');

const ticketInitialData = reactive({
  title: '',
  description: '',
  customerId: ''
});

const finishFormRef = ref<any>(null);
const finishForm = reactive({
  reason: '',
  description: ''
});

const finishRules = {
  reason: [{ required: true, message: 'Selecione o motivo da finalização', trigger: 'change' }],
  description: [{ required: true, message: 'Adicione uma descrição obrigatória', trigger: 'blur' }]
};

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value;
};


const handleSelectContact = (contact: IContact) => {
  selectedContact.value = contact;
  store.selectContact(contact as any);
  isProfileOpen.value = false;
};

const handleBackToList = () => {
  selectedContact.value = null;
  if ('activeContactId' in store) {
    (store as any).activeContactId = null;
  }
  isProfileOpen.value = false;
};

const handleAssumirChat = () => {
  if (selectedContact.value) {
    store.assumirChat(selectedContact.value.id as any);
    ElMessage.success('Você assumiu este atendimento!');
  }
};


const handleSendMessage = (payload: Omit<SendMessageDTO, 'contactId'>) => {
  if (selectedContact.value) {
    store.sendMessage({ ...payload, contactId: selectedContact.value.id });
  }
};

const confirmTransfer = () => {
  if (selectedContact.value && transferDest.value) {
    store.transferirChat(selectedContact.value.id, transferDest.value);
    ElMessage.success('Chat transferido com sucesso!');
    isTransferModalOpen.value = false;
    transferDest.value = '';
    handleBackToList();
  }
};

const openFinishModal = () => {
  isFinishModalOpen.value = true;
};

const confirmFinish = () => {
  if (!finishFormRef.value) return;
  finishFormRef.value.validate((valid: boolean) => {
    if (valid && selectedContact.value) {
      store.finishChat(selectedContact.value.id, finishForm.reason, finishForm.description);
      ElMessage.success('Atendimento finalizado e histórico salvo!');
      isFinishModalOpen.value = false;
      finishForm.reason = '';
      finishForm.description = '';
      handleBackToList();
    }
  });
};

const openLinkModal = () => {
  isLinkModalOpen.value = true;
};

const handleCustomerLinked = (data: any) => {
  if (selectedContact.value) {
    store.linkCustomerToChat(selectedContact.value.id, data);
    ElMessage.success('Cliente vinculado ao chat com sucesso!');
    isLinkModalOpen.value = false;
  }
};

const openTicketModal = () => {
  if (selectedContact.value) {
    ticketInitialData.title = `Atendimento - ${selectedContact.value.name}`;
    ticketInitialData.description = `Ticket originado do WhatsApp.\nÚltima mensagem: ${selectedContact.value.lastMessage}`;
    ticketInitialData.customerId = selectedContact.value.customerId || '';
    isTicketModalOpen.value = true;
  }
};

const submitTicket = (ticketData: any) => {
  console.log('Ticket salvo:', ticketData);
  ElMessage.success('Ticket criado com sucesso!');
  isTicketModalOpen.value = false;
};

const handleApproveKanban = () => {
};
</script>

<style scoped>
</style>