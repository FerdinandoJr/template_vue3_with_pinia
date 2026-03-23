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
        <el-button type="danger" @click="submitFinish">Finalizar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { ArrowLeft, Close, ChatLineSquare } from '@element-plus/icons-vue';
import { useChatStore } from '../store/chat.store';
import { useCustomerStore } from '@/modules/customer/ui/store/customer.store';
import { useTicketsStore } from '@/modules/tickets/ui/store/tickets.store';
import { ElMessage } from 'element-plus';
import ContactList from '../components/ContactList.vue';
import ChatArea from '../components/ChatArea.vue';
import ChatProfile from '../components/ChatProfile.vue';
import LinkCustomerModal from '../components/modals/LinkCustomerModal.vue';
import TicketModal from '@/modules/tickets/ui/components/TicketModal.vue';

const store = useChatStore();
const customerStore = useCustomerStore();
const ticketsStore = useTicketsStore();
const { messages, selectedContact } = storeToRefs(store);
const isProfileOpen = ref(false);
const isLinkModalOpen = ref(false);
const isTransferModalOpen = ref(false);
const transferDest = ref('');
const isFinishModalOpen = ref(false);
const finishFormRef = ref();
const finishForm = reactive({ reason: '', description: '' });
const finishRules = { 
  reason: [{ required: true, message: 'Informe a resolução', trigger: 'blur' }],
  description: [{ required: true, message: 'A descrição das observações é obrigatória', trigger: 'blur' }]
};
const isTicketModalOpen = ref(false);
const ticketInitialData = ref<any>(null);
const handleSelectContact = (contact: any) => { store.selectContact(contact); isProfileOpen.value = false; };
const handleBackToList = () => { store.selectContact(null as any); isProfileOpen.value = false; };
const toggleProfile = () => { isProfileOpen.value = !isProfileOpen.value; };

const handleSendMessage = (payload: any) => {
  if (selectedContact.value) store.sendMessage({ contactId: selectedContact.value.id, text: payload.text, type: payload.type, file: payload.file });
};

const handleAssumirChat = () => { if (selectedContact.value) store.assumirChat(selectedContact.value.id); };
const openLinkModal = () => { isLinkModalOpen.value = true; };

const confirmTransfer = () => {
  if (selectedContact.value && transferDest.value) {
    store.transferirChat(selectedContact.value.id, transferDest.value);
    ElMessage.success(`Chat transferido para ${transferDest.value}`);
    isTransferModalOpen.value = false;
    transferDest.value = '';
  }
};

const handleCustomerLinked = async (payload: any) => {
  try {
    const activeContact = store.selectedContact;
    if (activeContact) {
      if (!payload.isNew) {
        const customer = customerStore.items.find(c => c.uuid === payload.customerUuid);
        if (customer) {
          store.linkCustomerToChat(activeContact.id, { id: customer.uuid, name: payload.contactName || customer.name, company: customer.companyName });
          
          const currentContacts = customer.contacts || [];
          if (!currentContacts.includes(activeContact.id)) {
            await customerStore.updateCustomer(customer.uuid, { contacts: [...currentContacts, activeContact.id] });
          }
          
          ElMessage.success('Cliente vinculado!');
        }
      } else {
        const data = payload.customerData;
        data.contacts = [activeContact.id];
        
        const newCustomer = await customerStore.createCustomer(data);
        if (newCustomer) {
          store.linkCustomerToChat(activeContact.id, { id: newCustomer.uuid, name: newCustomer.name, company: newCustomer.companyName });
          ElMessage.success('Novo cliente criado e vinculado!');
        }
      }
    }
    isLinkModalOpen.value = false;
  } catch (error) { ElMessage.error('Erro ao vincular.'); }
};

const openFinishModal = () => { finishForm.reason = ''; finishForm.description = ''; isFinishModalOpen.value = true; };

const submitFinish = async () => {
  if (!finishFormRef.value) return;
  await finishFormRef.value.validate((valid: boolean) => {
    if (valid && selectedContact.value) {
      store.finishChat(selectedContact.value.id, finishForm.reason, finishForm.description);
      ElMessage.success('Atendimento finalizado.');
      isFinishModalOpen.value = false;
    }
  });
};

const openTicketModal = (contact: any) => {
  if (!contact) return;

  const chatHistoryExport = (messages.value || []).map((msg: any) => ({
    sender: msg.type === 'out' ? 'Você (Agente)' : (contact?.name || 'Cliente'),
    text: msg.text,
    time: msg.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    isAgent: msg.type === 'out'
  }));

  ticketInitialData.value = {
    title: `Suporte para ${contact?.name || 'Cliente'}`,
    customer: contact?.company || contact?.name || '',
    description: `Ticket aberto a partir do atendimento do WhatsApp.\nContato: ${contact?.phone || ''}`,
    chatHistory: chatHistoryExport,
    status: 'pending_approval'
  };

  isTicketModalOpen.value = true;
};

const submitTicket = async (data: any) => {
  if (typeof (ticketsStore as any).createTicket === 'function') {
    await (ticketsStore as any).createTicket(data);
  } else if (typeof (ticketsStore as any).create === 'function') {
    await (ticketsStore as any).create(data);
  } else if (typeof (ticketsStore as any).addTicket === 'function') {
    await (ticketsStore as any).addTicket(data);
  }
  isTicketModalOpen.value = false;
  ElMessage.success('Ticket criado com sucesso!');
};
</script>