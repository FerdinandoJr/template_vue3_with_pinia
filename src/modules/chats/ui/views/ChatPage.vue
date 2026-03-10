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

    <LinkCustomerModal :is-open="isLinkModalOpen" :contact-phone="selectedContact?.phone || ''"
      :contact-name="selectedContact?.name || ''" :contact-avatar="selectedContact?.avatar || ''"
      @close="isLinkModalOpen = false" @linked="handleCustomerLinked" />

    <TicketModal :is-open="isTicketModalOpen" :ticket="null" :initial-data="ticketInitialData"
      @close="isTicketModalOpen = false" @save="submitTicket" />

    <el-dialog v-model="isTransferModalOpen" title="Transferir Atendimento" width="400px" align-center>
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

    <el-dialog v-model="isFinishModalOpen" title="Finalizar Atendimento" width="500px">
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
        <el-form-item label="Descrição / Observações (Opcional)">
          <el-input v-model="finishForm.description" type="textarea" :rows="4"
            placeholder="Adicione notas sobre o atendimento..." />
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
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';

import { ChatLineSquare } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';

import ContactList from '../components/ContactList.vue';
import ChatArea from '../components/ChatArea.vue';
import ChatProfile from '../components/ChatProfile.vue';
import LinkCustomerModal from '../components/modals/LinkCustomerModal.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';

import type { SendMessageDTO } from '../../domain/dto/chat.dto';

const store = useChatStore();
const ticketsStore = useTicketsStore();
const { messages, selectedContact } = storeToRefs(store);

const isTransferModalOpen = ref(false);
const isFinishModalOpen = ref(false);
const isLinkModalOpen = ref(false);
const isProfileOpen = ref(false);
const transferDest = ref('');

const confirmTransfer = () => {
  if (!selectedContact.value || !transferDest.value) return;
  store.transferirChat(selectedContact.value.id, transferDest.value);
  ElMessage.success(`Chat transferido com sucesso!`);
  isTransferModalOpen.value = false;
  transferDest.value = '';
};

const openLinkModal = () => {
  if (!selectedContact.value) return;
  isLinkModalOpen.value = true;
};

const handleCustomerLinked = (customerData: { id: string, name: string, company?: string }) => {
  if (selectedContact.value) {
    store.linkCustomerToChat(selectedContact.value.id, customerData);
    ElMessage.success('Cliente vinculado com sucesso!');
  }
  isLinkModalOpen.value = false;
};

const finishFormRef = ref<FormInstance>();
const finishForm = reactive({
  reason: '',
  description: ''
});

const finishRules = reactive<FormRules>({
  reason: [{ required: true, message: 'Por favor, selecione um motivo.', trigger: 'change' }]
});

const openFinishModal = () => {
  finishForm.reason = '';
  finishForm.description = '';
  isFinishModalOpen.value = true;
  setTimeout(() => {
    finishFormRef.value?.clearValidate();
  }, 50);
};

const submitFinish = async () => {
  if (!finishFormRef.value) return;
  await finishFormRef.value.validate((valid) => {
    if (valid) {
      if (selectedContact.value) {
        store.finalizarChat(selectedContact.value.id, finishForm.reason);
        ElMessage.success('Atendimento finalizado!');
      }
      isFinishModalOpen.value = false;
    }
  });
};

const handleSelectContact = (contact: any) => {
  store.selectContact(contact);
};

const handleSendMessage = (payload: Omit<SendMessageDTO, 'contactId'>) => {
  if (selectedContact.value) {
    store.sendMessage({
      contactId: selectedContact.value.id,
      ...payload
    });
  }
};

const handleAssumirChat = () => {
  if (selectedContact.value) {
    store.assumirChat(selectedContact.value.id);
    ElMessage.success('Você assumiu este atendimento!');
  }
};

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value;
};

const isTicketModalOpen = ref(false);
const ticketInitialData = ref<any>(null);

const openTicketModal = () => {
  if (!selectedContact.value) return;

  ticketInitialData.value = {
    title: `Atendimento: ${selectedContact.value.name}`,
    customer: selectedContact.value.company ? `${selectedContact.value.name} - ${selectedContact.value.company}` : selectedContact.value.name,
    chatHistory: messages.value.map(m => ({
      sender: m.isMine ? 'Agente' : selectedContact.value!.name,
      text: m.text,
      time: m.timestamp,
      isAgent: m.isMine
    }))
  };

  isTicketModalOpen.value = true;
};

const submitTicket = async (data: any) => {
  try {
    await ticketsStore.createTicket(data);
    ElMessage.success('Ticket criado e enviado para a gestão com sucesso!');
    isTicketModalOpen.value = false;
  } catch (error) {
    ElMessage.error('Erro ao enviar o ticket.');
  }
};
</script>