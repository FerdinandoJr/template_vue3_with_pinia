<template>
    <div class="h-[calc(100vh-4rem)] p-6 bg-[#f8fafd] flex flex-col overflow-hidden">

        <div class="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5 shrink-0">
            <div class="min-w-0">
                <h2 class="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <el-icon class="text-blue-600">
                        <Monitor />
                    </el-icon>
                    Monitor de Equipe
                </h2>
                <p class="text-slate-500 text-sm font-medium mt-1 truncate">Acompanhe a fila, a carga de trabalho e o
                    histórico de cada atendente</p>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto shrink-0">

                <el-select v-model="monitorStore.selectedAgents" multiple collapse-tags collapse-tags-tooltip
                    placeholder="Filtrar" class="enterprise-select w-full sm:w-[280px] lg:w-[300px]">
                    <template #prefix>
                        <el-icon class="text-slate-400">
                            <Filter />
                        </el-icon>
                    </template>

                    <el-option label="Fila de Espera" value="0">
                        <div class="flex items-center gap-2">
                            <el-avatar :size="20" class="bg-orange-100 text-orange-600 font-bold text-[10px]">
                                <el-icon>
                                    <Timer />
                                </el-icon>
                            </el-avatar>
                            <span class="font-bold text-slate-700">Fila de Espera</span>
                        </div>
                    </el-option>

                    <el-option v-for="agent in monitorStore.teamMembersList" :key="agent.id" :label="agent.name"
                        :value="agent.id">
                        <div class="flex items-center gap-2">
                            <el-avatar :size="20" class="bg-blue-100 text-blue-700 font-bold text-[10px]">
                                {{ agent.name.charAt(0).toUpperCase() }}
                            </el-avatar>
                            <span class="font-semibold text-slate-700">{{ agent.name }}</span>
                        </div>
                    </el-option>
                </el-select>

                <el-input v-model="monitorStore.searchQuery" placeholder="Buscar cliente..." clearable
                    :prefix-icon="Search" class="enterprise-input w-full sm:w-[280px] lg:w-[300px]" />
            </div>
        </div>

        <div v-if="monitorStore.groupedByAgent.length === 0"
            class="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
            <el-icon :size="48" class="mb-4">
                <Search />
            </el-icon>
            <p class="text-lg font-bold">Nenhum registro encontrado</p>
        </div>

        <div v-else
            class="flex-1 overflow-y-auto custom-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6 content-start pr-2">

            <div v-for="group in monitorStore.groupedByAgent" :key="group.agentId"
                class="flex flex-col bg-slate-100/80 rounded-2xl border border-slate-200 h-[580px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                <div class="bg-white p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div class="flex items-center gap-3">
                        <el-avatar :size="40"
                            :class="group.agentId === '0' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-700'"
                            class="font-black border border-slate-100 shadow-sm">
                            <el-icon v-if="group.agentId === '0'">
                                <Timer />
                            </el-icon>
                            <span v-else>{{ group.agentName.charAt(0).toUpperCase() }}</span>
                        </el-avatar>
                        <div class="flex flex-col overflow-hidden">
                            <span class="font-bold text-slate-800 text-sm truncate" :title="group.agentName">{{
                                group.agentName
                            }}</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {{ group.agentId === '0' ? 'Não Atribuídos' : 'Online' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto custom-scroll p-5 flex flex-col gap-6">

                    <div class="flex flex-col gap-3.5">
                        <div class="flex items-center justify-between mb-2">
                            <h5 class="text-xs font-black text-slate-500 uppercase tracking-wider">
                                {{ group.agentId === '0' ? 'Na Fila de Espera' : 'Em Andamento' }}
                            </h5>
                            <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{{
                                group.ongoing.length }}</span>
                        </div>

                        <div v-if="group.ongoing.length === 0"
                            class="border-2 border-dashed border-slate-200/80 rounded-xl p-5 flex items-center justify-center text-slate-400 text-xs font-medium bg-slate-50/50">
                            Nenhum chamado ativo
                        </div>

                        <div v-for="chat in group.ongoing" :key="chat.id"
                            class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all relative cursor-default">
                            <div class="flex justify-between items-start mb-2.5">
                                <span class="text-sm font-bold text-slate-800 truncate pr-2 flex-1"
                                    :title="chat.company || chat.name">{{ chat.company || chat.name }}</span>
                                <el-tag size="small" :type="chat.status === 'queued' ? 'warning' : 'primary'"
                                    effect="light"
                                    class="!border-none font-bold uppercase text-[9px] tracking-widest shrink-0">
                                    {{ chat.status === 'queued' ? 'Aguardando' : 'Em Atendimento' }}
                                </el-tag>
                            </div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">{{ chat.tags
                                &&
                                chat.tags.length ? chat.tags[0] : 'Geral' }}</div>

                            <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                                <div class="flex items-center gap-1.5 text-xs" title="Tempo na fila de espera">
                                    <el-icon class="text-slate-400 text-sm">
                                        <Timer />
                                    </el-icon>
                                    <span
                                        :class="['font-mono font-bold', getWaitTime(chat) > 300 ? 'text-red-500' : 'text-slate-500']">{{
                                            formatWaitTime(chat) }}</span>
                                </div>
                                <div class="flex items-center gap-1.5 text-xs" title="Tempo efetivo em atendimento">
                                    <el-icon class="text-slate-400 text-sm">
                                        <Clock />
                                    </el-icon>
                                    <span class="font-mono font-bold text-blue-600">{{ formatServiceTime(chat) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3.5 mt-2" v-if="group.agentId !== '0'">
                        <div class="flex items-center justify-between mb-2 border-t border-slate-200 pt-6">
                            <h5 class="text-xs font-black text-slate-500 uppercase tracking-wider">Concluídos Hoje</h5>
                            <span
                                class="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{{
                                    group.completed.length }}</span>
                        </div>

                        <div v-if="group.completed.length === 0"
                            class="border-2 border-dashed border-slate-200/80 rounded-xl p-5 flex items-center justify-center text-slate-400 text-xs font-medium bg-slate-50/50">
                            Nenhum concluído hoje
                        </div>

                        <div v-for="chat in group.completed" :key="'comp-' + chat.id"
                            class="bg-white p-3.5 rounded-xl border border-slate-200 opacity-75 hover:opacity-100 hover:shadow-sm transition-all flex flex-col gap-2 cursor-default">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold text-slate-700 truncate pr-2">{{ chat.company ||
                                    chat.name
                                }}</span>
                                <el-icon class="text-green-500 shrink-0">
                                    <Check />
                                </el-icon>
                            </div>
                            <div class="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                <span class="truncate pr-2">{{ chat.tags && chat.tags.length ? chat.tags[0] : 'Geral'
                                }}</span>
                                <span class="font-mono shrink-0">Duração: {{ formatServiceTime(chat) }}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Monitor, Timer, Clock, Check, Search, Filter } from '@element-plus/icons-vue';
import { useMonitorStore } from '@/modules/monitor/ui/store/monitor.store';

const monitorStore = useMonitorStore();
const now = ref(Date.now());
let timerInterval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    timerInterval = setInterval(() => {
        now.value = Date.now();
    }, 1000);
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});

const getWaitTime = (chat: any) => {
    if (!chat.createdAt) return 0;

    let waitMs = 0;
    if (chat.status === 'queued') {
        waitMs = now.value - chat.createdAt;
    } else if (chat.serviceStartedAt) {
        waitMs = chat.serviceStartedAt - chat.createdAt;
    }

    return Math.max(0, Math.floor(waitMs / 1000));
};

const formatWaitTime = (chat: any) => {
    const totalSeconds = getWaitTime(chat);
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
};

const formatServiceTime = (chat: any) => {
    let totalMs = chat.accumulatedTime || 0;

    if (chat.status === 'in_progress' && chat.lastActiveAt) {
        totalMs += (now.value - chat.lastActiveAt);
    }

    const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
};
</script>

<style scoped>
.enterprise-input :deep(.el-input__wrapper),
.enterprise-select :deep(.el-select__wrapper) {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px;
    background-color: #ffffff;
    min-height: 40px;
}

.enterprise-input :deep(.el-input__wrapper.is-focus),
.enterprise-select :deep(.el-select__wrapper.is-focus) {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.enterprise-select :deep(.el-select__tags) {
    flex-wrap: nowrap;
    overflow: hidden;
}

.enterprise-select :deep(.el-select__placeholder) {
    white-space: nowrap !important;
    overflow: visible !important;
    color: #64748b;
}


.custom-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
    margin-top: 4px;
    margin-bottom: 4px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(148, 163, 184, 0.3);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box;
    transition: background-color 0.2s ease-in-out;
}

.custom-scroll:hover::-webkit-scrollbar-thumb {
    background-color: rgba(148, 163, 184, 0.6);
    border: 1px solid transparent;
}
</style>