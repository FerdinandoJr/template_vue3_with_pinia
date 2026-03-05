<template>
  <div class="flex-1 flex flex-col h-full bg-[#efeae2] relative border-r border-slate-200">
    <ChatHeader :contact="contact" @toggle-profile="onToggleProfile" @vincular="onVincular" @assumir="onAssumir"
      @abrir-modal-ticket="onAbrirModalTicket" @transferir="onTransferir" @finalizar="onFinalizar" />

    <ChatMessageList :messages="messages || []" />

    <ChatInput :contact-status="contact?.status" @send="onSend" />
  </div>
</template>

<script setup lang="ts">
import type { IContact, IMessage } from '../../domain/entities/chat';
import { MessageType } from '../../domain/valueObjects/chat-enums';
import type { SendMessageDTO } from '../../domain/dto/chat.dto';

import ChatHeader from './chat-area/ChatHeader.vue';
import ChatMessageList from './chat-area/ChatMessageList.vue';
import ChatInput from './chat-area/ChatInput.vue';

const props = defineProps<{
  contact?: IContact;
  messages?: IMessage[];
}>();

const emit = defineEmits<{
  (e: 'send', payload: Omit<SendMessageDTO, 'contactId'>): void;
  (e: 'transferir', contactId?: string): void;
  (e: 'finalizar', contactId?: string): void;
  (e: 'assumir', contactId?: string): void;
  (e: 'vincular'): void;
  (e: 'abrir-modal-ticket', contact?: IContact): void;
  (e: 'toggle-profile'): void;
}>();

const onToggleProfile = () => emit('toggle-profile');
const onVincular = () => emit('vincular');
const onAssumir = () => emit('assumir', props.contact?.id);
const onTransferir = () => emit('transferir', props.contact?.id);
const onFinalizar = () => emit('finalizar', props.contact?.id);
const onAbrirModalTicket = () => emit('abrir-modal-ticket', props.contact);

const onSend = (text: string, type: MessageType, file?: File) => {
  emit('send', { text, type, file });
};
</script>