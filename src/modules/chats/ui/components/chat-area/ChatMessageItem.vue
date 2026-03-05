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

        <div v-else :class="['flex w-full', message.isMine ? 'justify-end' : 'justify-start']">
            <div class="relative flex items-end gap-2 max-w-[65%]">
                <div
                    :class="['px-3 py-2 rounded-lg text-[14px] shadow-sm flex flex-col', message.isMine ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none']">
                    <span class="leading-relaxed whitespace-pre-wrap">{{ message.text }}</span>
                    <div
                        class="text-[10px] text-slate-400 font-semibold mt-1 text-right flex justify-end items-center gap-1">
                        {{ message.timestamp }}
                        <span v-if="message.isMine" class="text-blue-500 font-black text-[11px]">✓✓</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Lock } from '@element-plus/icons-vue';
import type { IMessage } from '../../../domain/entities/chat';

defineProps<{ message: IMessage; }>();
</script>