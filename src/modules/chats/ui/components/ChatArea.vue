<template>
  <div class="flex-1 flex flex-col h-full bg-[#efeae2] relative border-r border-slate-200">

    <div class="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-white z-10 shadow-sm shrink-0">

      <div @click="$emit('toggle-profile')"
        class="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-xl transition-colors group">
        <el-avatar :size="40" :src="contact?.avatar" class="bg-slate-200 text-slate-400">
          {{ contact?.name?.charAt(0).toUpperCase() || '?' }}
        </el-avatar>
        <div>
          <h3
            class="font-bold text-slate-800 text-[14px] leading-tight mb-0.5 group-hover:text-blue-600 transition-colors">
            {{ contact?.name || 'Selecione um contato' }}
          </h3>
          <p v-if="contact" class="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <span v-if="contact.company">{{ contact.company }} • </span>
            <span class="text-[#25D366] font-black uppercase tracking-widest">{{ contact.channel }}</span>
          </p>
        </div>
      </div>

      <div class="flex gap-2" v-if="contact">
        <el-button v-if="isUnsavedContact" @click="$emit('vincular')" type="primary" plain size="small"
          class="!font-bold">
          <el-icon class="mr-1">
            <Plus />
          </el-icon> Adicionar
        </el-button>

        <template v-if="contact.status === 'queued'">
          <el-button @click="$emit('assumir', contact.id)" type="success" size="small"
            class="!font-bold !bg-[#25D366] !border-[#25D366]">
            <el-icon class="mr-1">
              <Pointer />
            </el-icon> Assumir Chamado
          </el-button>
        </template>

        <template v-else-if="contact.status === 'in_progress'">
          <el-button @click="$emit('abrir-modal-ticket', contact)" type="warning" plain size="small" class="!font-bold">
            <el-icon class="mr-1">
              <Ticket />
            </el-icon> Ticket
          </el-button>

          <el-button @click="$emit('transferir', contact.id)" plain size="small" class="!font-bold">
            <el-icon class="mr-1">
              <Switch />
            </el-icon> Transferir
          </el-button>

          <el-button @click="$emit('finalizar', contact.id)" type="danger" plain size="small" class="!font-bold">
            <el-icon class="mr-1">
              <Check />
            </el-icon> Finalizar
          </el-button>
        </template>
      </div>
    </div>

    <el-scrollbar ref="scrollbarRef" class="flex-1 bg-opacity-90"
      style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-repeat: repeat;">
      <div class="px-8 py-6 space-y-4">
        <div v-for="m in (messages || [])" :key="m.id" class="w-full flex flex-col relative z-10">

          <div v-if="m.type === 'alert'" class="flex justify-center my-3">
            <el-tag type="info" effect="light" class="!whitespace-normal !h-auto !py-2 !text-center !font-medium">
              {{ m.text }}
            </el-tag>
          </div>

          <div v-else-if="m.type === 'note'" class="flex w-full justify-end">
            <div class="relative flex items-end gap-2 max-w-[65%]">
              <div
                class="px-4 py-3 rounded-lg text-[14px] shadow-sm flex flex-col bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-none">
                <div
                  class="flex items-center gap-1.5 mb-1.5 text-amber-700 text-[10px] font-black uppercase tracking-widest border-b border-amber-200 pb-1">
                  <el-icon>
                    <Lock />
                  </el-icon> Nota Interna (Invisível ao Cliente)
                </div>
                <span class="leading-relaxed whitespace-pre-wrap font-medium">{{ m.text }}</span>
                <div class="text-[10px] font-bold mt-1 text-right text-amber-600">{{ m.timestamp }}</div>
              </div>
            </div>
          </div>

          <div v-else :class="['flex w-full', m.isMine ? 'justify-end' : 'justify-start']">
            <div class="relative flex items-end gap-2 max-w-[65%]">
              <div
                :class="['px-3 py-2 rounded-lg text-[14px] shadow-sm flex flex-col', m.isMine ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none']">
                <span class="leading-relaxed whitespace-pre-wrap">{{ m.text }}</span>
                <div
                  class="text-[10px] text-slate-400 font-semibold mt-1 text-right flex justify-end items-center gap-1">
                  {{ m.timestamp }}
                  <span v-if="m.isMine" class="text-blue-500">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <div class="shrink-0 flex flex-col bg-[#f0f2f5] relative border-t border-slate-200">

      <div v-if="attachedFile"
        class="absolute bottom-[100%] left-0 w-full p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shadow-md z-20">
        <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
          <el-icon>
            <Document />
          </el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-slate-700 truncate">{{ attachedFile?.name }}</p>
        </div>
        <el-button @click="clearAttachment" circle type="danger" size="small" plain><el-icon>
            <Close />
          </el-icon></el-button>
      </div>

      <template v-if="contact?.status !== 'in_progress'">
        <div class="w-full text-center py-5 text-slate-500 text-sm font-medium">
          <span class="mr-2">🔒</span> Assuma o chamado para enviar mensagens.
        </div>
      </template>

      <template v-else>
        <div class="flex items-end px-4 pt-2">
          <div class="flex bg-white rounded-t-lg border border-b-0 border-slate-200 overflow-hidden">
            <button @click="isInternalNote = false"
              :class="['px-4 py-1.5 text-xs font-bold transition-colors', !isInternalNote ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50']">Mensagem
              Cliente</button>
            <button @click="isInternalNote = true"
              :class="['px-4 py-1.5 text-xs font-bold transition-colors', isInternalNote ? 'bg-amber-50 text-amber-600' : 'text-slate-500 hover:bg-slate-50']">Nota
              Interna</button>
          </div>
        </div>

        <div
          :class="['px-4 py-3 shrink-0 flex items-center gap-2 transition-colors border-t', isInternalNote ? 'bg-amber-50 border-amber-200' : 'bg-[#f0f2f5] border-slate-200']">

          <el-popover placement="top-start" :width="200" trigger="click">
            <template #reference>
              <el-button circle :type="isInternalNote ? 'warning' : 'info'" plain>
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </template>
            <div class="flex flex-col gap-1">
              <el-button text class="!justify-start" @click="triggerDocUpload">
                <el-icon class="mr-2">
                  <Document />
                </el-icon> Documento
              </el-button>
              <el-button text class="!justify-start" @click="triggerImageUpload">
                <el-icon class="mr-2">
                  <Picture />
                </el-icon> Fotos e Vídeos
              </el-button>
            </div>
          </el-popover>

          <input type="file" ref="docInput" class="hidden" accept="*" @change="handleFileUpload" />
          <input type="file" ref="imageInput" class="hidden" accept="image/*,video/*" @change="handleFileUpload" />

          <el-input v-model="text" @keyup.enter="send"
            :placeholder="isInternalNote ? 'Digite uma nota interna...' : 'Digite uma mensagem...'" type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }" resize="none" class="flex-1"
            :input-style="{ backgroundColor: isInternalNote ? '#fffbeb' : '#ffffff', borderRadius: '8px' }" />

          <el-button @click="send" :disabled="!text.trim() && !attachedFile" circle
            :type="isInternalNote ? 'warning' : 'primary'">
            <el-icon>
              <Position />
            </el-icon>
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { Plus, Check, Pointer, Ticket, Switch, Document, Close, Picture, Position, Lock } from '@element-plus/icons-vue';
import type { IContact, IMessage } from '../../domain/entities/chat';
import { MessageType } from '../../domain/valueObjects/chat-enums';
import { ElScrollbar } from 'element-plus';

const props = defineProps<{ contact?: IContact, messages?: IMessage[] }>();

const emit = defineEmits([
  'send',
  'transferir',
  'finalizar',
  'assumir',
  'vincular',
  'abrir-modal-ticket',
  'toggle-profile'
]);

const text = ref('');
const isInternalNote = ref(false);
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const docInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const attachedFile = ref<File | null>(null);

const isUnsavedContact = computed(() => {
  if (!props.contact) return false;
  return props.contact.name === props.contact.phone || String(props.contact.name).includes('+');
});

const scrollToBottom = async () => {
  await nextTick();
  if (scrollbarRef.value) {
    const wrap = scrollbarRef.value.wrapRef;
    if (wrap) wrap.scrollTop = wrap.scrollHeight;
  }
};

watch(() => props.messages?.length, () => scrollToBottom());
onMounted(() => scrollToBottom());

const triggerDocUpload = () => docInput.value?.click();
const triggerImageUpload = () => imageInput.value?.click();

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    attachedFile.value = file;
    target.value = '';
  }
};

const clearAttachment = () => attachedFile.value = null;

const send = () => {
  if (text.value.trim() || attachedFile.value) {
    const type = isInternalNote.value ? MessageType.NOTE : MessageType.TEXT;
    emit('send', text.value, type, attachedFile.value || undefined);
    text.value = '';
    clearAttachment();
  }
};
</script>