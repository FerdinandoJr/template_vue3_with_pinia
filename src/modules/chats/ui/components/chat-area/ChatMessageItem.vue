<template>
    <div class="w-full flex flex-col relative z-10">

        <div v-if="message.type === 'alert'" class="flex justify-center my-3">
            <el-tag type="info" effect="light" class="!whitespace-normal !h-auto !py-2 !text-center !font-medium">
                {{ message.text }}
            </el-tag>
        </div>

        <div v-else-if="message.type === 'note'" class="flex w-full justify-end">
            <div class="relative flex items-end gap-2 max-w-[65%]">
                <div
                    class="px-4 py-3 rounded-lg text-[14px] shadow-sm flex flex-col bg-amber-50 border border-amber-200 text-amber-900 rounded-tr-none">
                    <div
                        class="flex items-center gap-1.5 mb-1.5 text-amber-700 text-[10px] font-black uppercase tracking-widest border-b border-amber-200 pb-1">
                        <el-icon>
                            <Lock />
                        </el-icon> Nota Interna (Invisível ao Cliente)
                    </div>
                    <span class="leading-relaxed whitespace-pre-wrap font-medium">{{ message.text }}</span>
                    <div class="text-[10px] font-bold mt-1 text-right text-amber-600">{{ message.timestamp }}</div>
                </div>
            </div>
        </div>

        <div v-else :class="['flex w-full group items-center gap-3', message.isMine ? 'justify-end' : 'justify-start']">

            <div v-if="!message.isMine"
                class="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                <el-button @click="store.setReplyingTo(message)" circle size="small" title="Responder"
                    class="!bg-white shadow-sm !border-slate-200 text-slate-500 hover:text-blue-500">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                    </svg>
                </el-button>
            </div>

            <div class="relative flex items-end max-w-[65%]">
                <div
                    :class="['px-3 py-2 rounded-lg text-[14px] shadow-sm flex flex-col', message.isMine ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none']">

                    <div v-if="message.replyTo"
                        class="bg-black/5 border-l-4 border-blue-500 rounded p-2 mb-1 cursor-pointer hover:bg-black/10 transition-colors">
                        <div class="text-[12px] font-bold text-blue-600 mb-0.5">{{ message.replyTo.isMine ? 'Você' :
                            'Cliente' }}</div>
                        <div class="text-[12px] text-slate-600 truncate max-w-[200px] flex items-center gap-1">
                            <el-icon v-if="message.replyTo.type === 'audio'">
                                <Microphone />
                            </el-icon>
                            <el-icon v-else-if="message.replyTo.type === 'image'">
                                <Picture />
                            </el-icon>
                            <el-icon v-else-if="message.replyTo.type === 'file'">
                                <Document />
                            </el-icon>
                            {{ message.replyTo.type === 'audio' ? 'Mensagem de voz' : (message.replyTo.type === 'image'
                                ? 'Imagem' : message.replyTo.text) }}
                        </div>
                    </div>

                    <template v-if="message.type === 'audio'">
                        <div class="flex items-center gap-2 mb-1">
                            <audio v-if="message.fileUrl" :src="message.fileUrl" controls
                                class="h-10 w-[240px] outline-none"></audio>
                            <span v-else class="italic text-slate-500 text-sm">Áudio indisponível</span>
                        </div>
                    </template>
                    <template v-else-if="message.type === 'image'">
                        <div class="mb-1">
                            <img v-if="message.fileUrl" :src="message.fileUrl"
                                class="max-w-[240px] max-h-[240px] rounded-lg shadow-sm cursor-pointer object-cover border border-black/5" />
                            <span v-else class="italic text-slate-500 text-sm">Imagem indisponível</span>
                        </div>
                        <span v-if="message.text && message.text !== message.fileName"
                            class="leading-relaxed whitespace-pre-wrap mt-1">{{ message.text }}</span>
                    </template>
                    <template v-else-if="message.type === 'file'">
                        <a v-if="message.fileUrl" :href="message.fileUrl" target="_blank"
                            class="flex items-center gap-3 bg-black/5 p-2.5 rounded-lg hover:bg-black/10 transition-colors mb-1 no-underline border border-black/5">
                            <div
                                class="w-8 h-8 bg-white text-blue-600 rounded flex items-center justify-center shrink-0 shadow-sm">
                                <el-icon>
                                    <Document />
                                </el-icon>
                            </div>
                            <span class="text-[13px] font-bold text-slate-700 truncate max-w-[180px]">{{
                                message.fileName || message.text }}</span>
                        </a>
                        <span v-else class="italic text-slate-500 text-sm">Arquivo indisponível</span>
                    </template>
                    <template v-else>
                        <span class="leading-relaxed whitespace-pre-wrap">{{ message.text }}</span>
                    </template>

                    <div
                        class="text-[10px] text-slate-400 font-semibold mt-1 text-right flex justify-end items-center gap-1">
                        {{ message.timestamp }}
                        <span v-if="message.isMine" class="text-blue-500 font-black text-[11px]">✓✓</span>
                    </div>
                </div>
            </div>

            <div v-if="message.isMine"
                class="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                <el-button @click="store.setReplyingTo(message)" circle size="small" title="Responder"
                    class="!bg-white shadow-sm !border-slate-200 text-slate-500 hover:text-blue-500">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" />
                    </svg>
                </el-button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { Lock, Document, Microphone, Picture } from '@element-plus/icons-vue';
import type { IMessage } from '../../../domain/entities/chat';
import { useChatStore } from '../../store/chat.store';

defineProps<{ message: IMessage; }>();
const store = useChatStore();
</script>

<style scoped>
audio::-webkit-media-controls-panel {
    background-color: transparent;
}

audio::-webkit-media-controls-play-button,
audio::-webkit-media-controls-mute-button {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
}
</style>