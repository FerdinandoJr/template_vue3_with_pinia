<template>
    <el-scrollbar ref="scrollbarRef" class="flex-1 bg-opacity-90"
        style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-repeat: repeat;">
        <div class="px-8 py-6 space-y-4">
            <ChatMessageItem v-for="m in messages" :key="m.id" :message="m" />
        </div>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { ElScrollbar } from 'element-plus';
import type { IMessage } from '../../../domain/entities/chat';
import ChatMessageItem from './ChatMessageItem.vue';

const props = defineProps<{ messages?: IMessage[]; }>();

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();

const scrollToBottom = async () => {
    await nextTick();
    if (scrollbarRef.value) {
        const wrap = scrollbarRef.value.wrapRef;
        if (wrap) wrap.scrollTop = wrap.scrollHeight;
    }
};

watch(() => props.messages?.length, () => scrollToBottom());
onMounted(() => scrollToBottom());
</script>