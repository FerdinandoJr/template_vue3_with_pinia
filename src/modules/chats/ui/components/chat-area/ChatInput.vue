<template>
    <div class="shrink-0 flex flex-col bg-[#f0f2f5] relative border-t border-slate-200"
        @dragenter.prevent="isDragging = true" @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop">

        <div v-if="isDragging"
            class="absolute inset-0 bg-blue-600/90 z-50 flex flex-col items-center justify-center text-white rounded-t-lg transition-all backdrop-blur-[2px]">
            <el-icon class="text-5xl mb-3 animate-bounce">
                <UploadFilled />
            </el-icon>
            <h2 class="text-xl font-bold tracking-wide">Solte o arquivo aqui</h2>
            <p class="text-blue-100 mt-1 text-sm font-medium">O anexo será adicionado à conversa</p>
        </div>

        <div v-if="attachedFile && !isRecording"
            class="absolute bottom-[100%] left-0 w-full p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shadow-md z-20">

            <div v-if="audioPreviewUrl"
                class="flex-1 flex items-center gap-3 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                <el-icon class="text-blue-500 text-xl shrink-0">
                    <Microphone />
                </el-icon>
                <audio :src="audioPreviewUrl" controls class="h-8 w-full outline-none bg-transparent"></audio>
            </div>

            <template v-else>
                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                    <el-icon :size="20">
                        <Picture v-if="attachedFile.type.includes('image') || attachedFile.type.includes('video')" />
                        <Document v-else />
                    </el-icon>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-700 truncate">{{ attachedFile.name }}</p>
                    <p class="text-[11px] text-slate-500 font-semibold">{{ (attachedFile.size / 1024).toFixed(1) }} KB
                    </p>
                </div>
            </template>

            <el-button @click="clearAttachment" circle type="danger" size="small" plain
                class="!border-none !bg-red-50 hover:!bg-red-100 shrink-0">
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
                :class="['px-4 py-3 shrink-0 flex items-end gap-2 transition-colors border-t', isInternalNote ? 'bg-amber-50 border-amber-200' : 'bg-[#f0f2f5] border-slate-200']">

                <div class="pb-1" v-if="!isRecording">
                    <el-popover placement="top-start" :width="280" trigger="click" :offset="12">
                        <template #reference>
                            <el-button circle plain
                                class="!w-10 !h-10 !border-none !bg-transparent hover:!bg-slate-200 !text-slate-500 transition-colors">
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2"
                                    fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                                </svg>
                            </el-button>
                        </template>

                        <div class="grid grid-cols-7 gap-1 h-[200px] overflow-y-auto p-1 emoji-scrollbar">
                            <button v-for="emoji in emojiList" :key="emoji" @click="insertEmoji(emoji)"
                                class="w-8 h-8 text-[20px] flex items-center justify-center hover:bg-slate-100 rounded cursor-pointer transition-colors active:scale-90">
                                {{ emoji }}
                            </button>
                        </div>
                    </el-popover>
                </div>

                <div class="pb-1" v-if="!isRecording">
                    <el-popover placement="top-start" :width="200" trigger="click">
                        <template #reference>
                            <el-button circle plain
                                class="!w-10 !h-10 !border-none !bg-transparent hover:!bg-slate-200 !text-slate-500 transition-colors">
                                <el-icon :size="22">
                                    <Plus />
                                </el-icon>
                            </el-button>
                        </template>

                        <div class="flex flex-col gap-1">
                            <el-button text @click="triggerDocUpload"
                                style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; width: 100%; margin-left: 0;">
                                <el-icon>
                                    <Document />
                                </el-icon> Documento
                            </el-button>
                            <el-button text @click="triggerImageUpload"
                                style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; width: 100%; margin-left: 0;">
                                <el-icon>
                                    <Picture />
                                </el-icon> Fotos e Vídeos
                            </el-button>
                        </div>
                    </el-popover>
                </div>

                <input type="file" ref="docInput" class="hidden" accept="*" @change="handleFileUpload" />
                <input type="file" ref="imageInput" class="hidden" accept="image/*,video/*"
                    @change="handleFileUpload" />

                <div v-if="isRecording"
                    class="flex-1 flex items-center gap-3 px-4 py-2 bg-red-50 rounded-full border border-red-200 animate-pulse h-[44px]">
                    <div class="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                    <span class="text-red-600 font-black text-[15px] tracking-widest">{{ formattedRecordTime }}</span>
                    <span class="text-red-400 text-xs ml-auto font-medium">Gravando áudio...</span>
                </div>

                <el-input v-else v-model="text" @keydown.enter.prevent="handleSend"
                    :placeholder="isInternalNote ? 'Digite uma nota interna...' : 'Digite uma mensagem...'"
                    type="textarea" :autosize="{ minRows: 1, maxRows: 5 }" resize="none" class="flex-1 chat-input-field"
                    :input-style="{ backgroundColor: isInternalNote ? '#fffbeb' : '#ffffff' }" />

                <div class="flex items-center gap-2 pb-1">

                    <el-button v-if="isRecording" @click="cancelRecording" circle type="danger" plain
                        class="!border-none !bg-red-100 hover:!bg-red-200 !w-10 !h-10">
                        <el-icon :size="18">
                            <Delete />
                        </el-icon>
                    </el-button>

                    <el-button v-if="text.trim() || attachedFile || isRecording"
                        @click="isRecording ? stopRecording() : handleSend()" circle
                        :type="isInternalNote ? 'warning' : 'primary'" class="!w-10 !h-10 !p-0 shadow-md send-btn">
                        <el-icon :size="18">
                            <Position v-if="!isRecording" />
                            <Check v-else />
                        </el-icon>
                    </el-button>

                    <el-button v-else @click="startRecording" circle
                        class="!border-none !bg-transparent hover:!bg-slate-200 !w-10 !h-10 transition-colors">
                        <el-icon :size="22" class="text-slate-500">
                            <Microphone />
                        </el-icon>
                    </el-button>

                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { Plus, Document, Close, Picture, Position, Microphone, UploadFilled, Delete, Check } from '@element-plus/icons-vue';
import { MessageType } from '../../../domain/valueObjects/chat-enums';

defineProps<{ contactStatus?: string; }>();
const emit = defineEmits<{
    (e: 'send', text: string, type: MessageType, file?: File): void;
}>();

const text = ref('');
const isInternalNote = ref(false);
const docInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const attachedFile = ref<File | null>(null);
const audioPreviewUrl = ref<string | null>(null);
const isDragging = ref(false);
const isRecording = ref(false);
const recordTime = ref(0);
let timerInterval: ReturnType<typeof setInterval>;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

const emojiList = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😐',
    '😎', '🤓', '🧐', '😕', '😟', '🥺', '😢', '😭', '😤', '😡',
    '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞',
    '❤️', '🔥', '✨', '🎉', '💯', '✅', '🚀', '💡', '📅', '📌'
];

const insertEmoji = (emoji: string) => {
    text.value += emoji;
};

watch(attachedFile, (newFile) => {
    if (audioPreviewUrl.value) {
        URL.revokeObjectURL(audioPreviewUrl.value);
        audioPreviewUrl.value = null;
    }
    if (newFile && newFile.type.includes('audio')) {
        audioPreviewUrl.value = URL.createObjectURL(newFile);
    }
});

onUnmounted(() => {
    if (audioPreviewUrl.value) URL.revokeObjectURL(audioPreviewUrl.value);
});

const formattedRecordTime = computed(() => {
    const m = String(Math.floor(recordTime.value / 60)).padStart(2, '0');
    const s = String(recordTime.value % 60).padStart(2, '0');
    return `${m}:${s}`;
});

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

const handleDrop = (event: DragEvent) => {
    isDragging.value = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
        attachedFile.value = file;
    }
};

const clearAttachment = () => {
    attachedFile.value = null;
};

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const fileName = `Audio_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
            attachedFile.value = new File([audioBlob], fileName, { type: 'audio/webm' });
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording.value = true;
        recordTime.value = 0;
        timerInterval = setInterval(() => { recordTime.value++; }, 1000);

    } catch (err) {
        console.error('Erro ao acessar microfone:', err);
        alert('Permissão de microfone negada ou dispositivo não encontrado.');
    }
};

const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop();
        isRecording.value = false;
        clearInterval(timerInterval);
    }
};

const cancelRecording = () => {
    if (mediaRecorder && isRecording.value) {
        mediaRecorder.stop();
        isRecording.value = false;
        clearInterval(timerInterval);
        setTimeout(() => { clearAttachment(); }, 50);
    }
};

const handleSend = () => {
    if (text.value.trim() || attachedFile.value) {
        const isAudioType = attachedFile.value?.type.includes('audio');
        let type = MessageType.TEXT;

        if (isInternalNote.value) {
            type = MessageType.NOTE;
        } else if (isAudioType) {
            type = MessageType.AUDIO;
        }

        emit('send', text.value, type, attachedFile.value || undefined);

        text.value = '';
        clearAttachment();
    }
};
</script>

<style scoped>
:deep(.chat-input-field .el-textarea__inner) {
    border-radius: 1.25rem;
    border-color: transparent;
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 0 0 1px #e2e8f0 inset;
    transition: all 0.2s ease;
}

:deep(.chat-input-field .el-textarea__inner:focus) {
    box-shadow: 0 0 0 2px #3b82f6 inset;
    outline: none;
}

.send-btn {
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-btn:hover {
    transform: scale(1.08);
}

audio::-webkit-media-controls-panel {
    background-color: transparent;
}

.emoji-scrollbar::-webkit-scrollbar {
    width: 5px;
}

.emoji-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.emoji-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.emoji-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>