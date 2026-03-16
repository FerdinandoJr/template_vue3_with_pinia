<template>
  <div class="flex h-full w-full bg-white overflow-hidden relative border-t border-slate-200">

    <ContactList :selectedId="selectedContact?.id" @select="handleSelectContact"
      :class="{ 'hidden md:flex': selectedContact }" />

    <template v-if="selectedContact">
      <div class="flex-1 flex w-full h-full relative"
        :class="{ 'flex': selectedContact, 'hidden md:flex': !selectedContact }">

        <button @click="handleBackToList"
          class="md:hidden absolute top-3 left-3 z-[60] bg-white border border-slate-200 shadow-md rounded-full p-1.5 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-all">
          <el-icon :size="20">
            <ArrowLeft />
          </el-icon>
        </button>

        <ChatArea class="w-full" :contact="selectedContact" :messages="messages" @send="handleSendMessage"
          @assumir="handleAssumirChat" @finalizar="openFinishModal" @transferir="isTransferModalOpen = true"
          @vincular="openLinkModal" @abrir-modal-ticket="openTicketModal" @toggle-profile="toggleProfile" />

        <div :class="[
          'transition-all duration-300 ease-in-out overflow-hidden h-full shrink-0 bg-white z-50 border-l border-slate-200 absolute right-0 md:relative',
          isProfileOpen ? 'w-full md:w-[320px] opacity-100' : 'w-0 opacity-0'
        ]">
          <button v-if="isProfileOpen" @click="toggleProfile"
            class="md:hidden absolute top-4 left-4 z-50 bg-slate-100 p-2 rounded-full text-slate-600">
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
      @close="isTicketModalOpen = false" @save="submitTicket" />

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

    <el-dialog v-model="isFinishModalOpen" title="Finalizar Atendimento" width="95%" style="max-width: 500px;">
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
import { ChatLineSquare, ArrowLeft, Close } from '@element-plus/icons-vue';
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

const handleBackToList = () => {
  store.selectContact(null as any);
  isProfileOpen.value = false;
};

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
const finishForm = reactive({ reason: '', description: '' });
const finishRules = reactive<FormRules>({
  reason: [{ required: true, message: 'Por favor, selecione um motivo.', trigger: 'change' }]
});

const openFinishModal = () => {
  finishForm.reason = '';
  finishForm.description = '';
  isFinishModalOpen.value = true;
  setTimeout(() => { finishFormRef.value?.clearValidate(); }, 50);
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
      handleBackToList();
    }
  });
};

const handleSelectContact = (contact: any) => {
  store.selectContact(contact);
};

const handleSendMessage = (payload: Omit<SendMessageDTO, 'contactId'>) => {
  if (selectedContact.value) {
    store.sendMessage({ contactId: selectedContact.value.id, ...payload });
  }
};

const handleAssumirChat = () => {
  if (selectedContact.value) {
    store.assumirChat(selectedContact.value.id);
    ElMessage.success('Você assumiu o atendimento!');
  }
};

const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value;
};

const isTicketModalOpen = ref(false);
const ticketInitialData = ref<any>(null);

const openTicketModal = () => {
  const contact = selectedContact.value;
  if (!contact) return;

  let lastStartIndex = -1;
  const msgs = messages.value || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const msg = msgs[i];
    if (msg && msg.type === 'alert' && msg.text?.includes('Atendimento iniciado')) {
      lastStartIndex = i;
      break;
    }
  }
  const currentSessionMessages = lastStartIndex !== -1 ? msgs.slice(lastStartIndex) : msgs;

  const history = currentSessionMessages.map(m => ({
    sender: m.isMine ? 'Atendente' : contact.name,
    text: m.text || '',
    time: m.timestamp,
    isAgent: m.isMine
  }));

  const protocoloStr = contact.serviceId ? ` #${contact.serviceId}` : '';
  ticketInitialData.value = {
    customer: contact.name,
    description: `Ticket gerado a partir do protocolo de atendimento${protocoloStr} via WhatsApp.\nPor favor, descreva o problema abaixo.`,
    chatHistory: history
  };
  isTicketModalOpen.value = true;
};

const submitTicket = async (ticketData: any) => {
  await ticketsStore.createTicket({ ...ticketData, chatHistory: ticketData.chatHistory });
  ElMessage.success('Ticket aberto com sucesso!');
  isTicketModalOpen.value = false;
};
</script>