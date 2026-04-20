<template>
    <div class="flex-1 relative flex flex-col min-h-0 bg-[#efeae2]">

        <div ref="scrollContainer"
            class="flex-1 overflow-y-auto p-4 md:px-8 flex flex-col gap-2 relative custom-scrollbar"
            @scroll="handleScroll">

            <div v-if="isLoadingOldMessages" class="flex justify-center pt-1 pb-3 w-full transition-all">
                <div
                    class="bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 text-slate-500 text-[12px] font-bold tracking-wide px-4 py-1.5 rounded-full flex items-center gap-2">
                    <el-icon class="is-loading text-blue-500 text-[14px]">
                        <Loading />
                    </el-icon>
                    <span>Carregando mensagens...</span>
                </div>
            </div>

            <ChatMessageItem v-for="msg in store.messages" :key="msg.id" :message="msg" />

        </div>

        <transition name="el-zoom-in-bottom">
            <div v-if="showScrollDownBtn" class="absolute bottom-4 right-6 z-20">
                <el-badge :value="unreadWhileScrolled" :hidden="unreadWhileScrolled === 0" type="success"
                    class="shadow-lg rounded-full">
                    <el-button circle @click="scrollToBottom(true)"
                        class="!w-10 !h-10 !bg-white !border-slate-200 text-slate-500 hover:text-blue-500 shadow-md transition-transform hover:scale-105">
                        <el-icon :size="20">
                            <ArrowDown />
                        </el-icon>
                    </el-button>
                </el-badge>
            </div>
        </transition>

    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { Loading, ArrowDown } from '@element-plus/icons-vue';
import ChatMessageItem from './ChatMessageItem.vue';
import { useChatStore } from '../../store/chat.store';

const store = useChatStore();
const scrollContainer = ref<HTMLElement | null>(null);

const isLoadingOldMessages = ref(false);
const showScrollDownBtn = ref(false);
const unreadWhileScrolled = ref(0);
let isUserScrollingUp = false;

const handleScroll = async () => {
    const el = scrollContainer.value;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distanceFromBottom > 80) {
        showScrollDownBtn.value = true;
        isUserScrollingUp = true;
    } else {
        showScrollDownBtn.value = false;
        isUserScrollingUp = false;
        unreadWhileScrolled.value = 0;
    }

    if (el.scrollTop === 0 && !isLoadingOldMessages.value && store.messages.length >= 10) {
        await loadOlderMessages();
    }
};

const loadOlderMessages = async () => {
    isLoadingOldMessages.value = true;
    const el = scrollContainer.value;
    if (!el) return;

    const oldScrollHeight = el.scrollHeight;

    await new Promise(resolve => setTimeout(resolve, 800));

    await nextTick();
    el.scrollTop = el.scrollHeight - oldScrollHeight;
    isLoadingOldMessages.value = false;
};

const scrollToBottom = async (smooth = false) => {
    await nextTick();
    const el = scrollContainer.value;
    if (el) {
        el.scrollTo({
            top: el.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });

        showScrollDownBtn.value = false;
        isUserScrollingUp = false;
        unreadWhileScrolled.value = 0;
    }
};

watch(() => store.messages.length, async (newLength, oldLength) => {
    if (newLength > oldLength) {
        const lastMsg = store.messages[store.messages.length - 1];

        if (lastMsg && lastMsg.isMine) {
            scrollToBottom(true);
            return;
        }

        if (isUserScrollingUp) {
            unreadWhileScrolled.value++;
        } else {
            scrollToBottom(true);
        }
    }
});

watch(() => store.activeContactId, () => {
    scrollToBottom(false);
});

onMounted(() => {
    scrollToBottom(false);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
}

.bg-\[\#efeae2\] {
    background-color: #efeae2;
    background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')
}
</style>