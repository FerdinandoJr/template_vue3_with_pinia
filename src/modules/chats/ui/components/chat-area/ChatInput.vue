<template>
    <div class="shrink-0 flex flex-col bg-[#f0f2f5] relative border-t border-slate-200">
        <div v-if="attachedFile"
            class="absolute bottom-[100%] left-0 w-full p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shadow-md z-20">
            <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                <el-icon>
                    <Document />
                </el-icon>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-700 truncate">{{ attachedFile.name }}</p>
            </div>
            <el-button @click="clearAttachment" circle type="danger" size="small" plain>
                <el-icon>
                    <Close />
                </el-icon>
            </el-button>
        </div>

        <template v-if="contactStatus !== 'in_progress'">
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
                <input type="file" ref="imageInput" class="hidden" accept="image/*,video/*"
                    @change="handleFileUpload" />

                <el-input v-model="text" @keyup.enter="handleSend"
                    :placeholder="isInternalNote ? 'Digite uma nota interna...' : 'Digite uma mensagem...'"
                    type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" resize="none" class="flex-1"
                    :input-style="{ backgroundColor: isInternalNote ? '#fffbeb' : '#ffffff', borderRadius: '8px' }" />

                <el-button @click="handleSend" :disabled="!text.trim() && !attachedFile" circle
                    :type="isInternalNote ? 'warning' : 'primary'">
                    <el-icon>
                        <Position />
                    </el-icon>
                </el-button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus, Document, Close, Picture, Position } from '@element-plus/icons-vue';
import { MessageType } from '../../../domain/valueObjects/chat-enums';

defineProps<{ contactStatus?: string; }>();

const emit = defineEmits<{ (e: 'send', text: string, type: MessageType, file?: File): void; }>();

const text = ref('');
const isInternalNote = ref(false);
const docInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const attachedFile = ref<File | null>(null);

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

const clearAttachment = () => { attachedFile.value = null; };

const handleSend = () => {
    if (text.value.trim() || attachedFile.value) {
        const type = isInternalNote.value ? MessageType.NOTE : MessageType.TEXT;
        emit('send', text.value, type, attachedFile.value || undefined);
        text.value = '';
        clearAttachment();
    }
};
</script>