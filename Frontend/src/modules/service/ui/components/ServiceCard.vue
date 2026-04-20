<template>
    <div
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative overflow-hidden group">
        <div class="absolute top-0 left-0 w-full h-1" :class="priorityColor"></div>

        <div class="flex justify-between items-start mb-4 mt-1">
            <div>
                <span
                    class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Protocolo</span>
                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                    #{{ service.protocol }}
                    <span v-if="isActive" class="relative flex h-2 w-2">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </h3>
            </div>
            <el-tag :type="statusTag.type" effect="light" size="small" class="!font-bold tracking-wide !border-none">
                {{ statusTag.label }}
            </el-tag>
        </div>

        <div class="flex-1 mb-4">
            <h4 class="text-base font-black text-slate-800 truncate mb-1" :title="service.customerName">
                {{ service.customerName }}
            </h4>
            <p class="text-xs font-bold text-blue-600 mb-2 truncate">{{ service.subject }}</p>
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">{{ service.description }}</p>
        </div>

        <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div class="flex flex-col">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tempo Gasto</span>
                <span class="text-2xl font-black font-mono tracking-tight"
                    :class="isActive ? 'text-emerald-600' : 'text-slate-600'">
                    {{ formattedTime }}
                </span>
            </div>

            <div v-if="service.status !== 'finished'" class="flex items-center gap-2">
                <el-tooltip :content="isActive ? 'Pausar' : 'Retomar'" placement="top">
                    <el-button circle :type="isActive ? 'warning' : 'success'" plain
                        @click="$emit('toggle', service.id)" class="!shadow-sm">
                        <el-icon>
                            <VideoPause v-if="isActive" />
                            <VideoPlay v-else />
                        </el-icon>
                    </el-button>
                </el-tooltip>
                <el-tooltip content="Finalizar Atendimento" placement="top">
                    <el-button circle type="primary" @click="$emit('finish', service.id)"
                        class="!shadow-sm shadow-blue-200">
                        <el-icon>
                            <Check />
                        </el-icon>
                    </el-button>
                </el-tooltip>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { VideoPause, VideoPlay, Check } from '@element-plus/icons-vue';
import type { IServiceItem } from '../../domain/entities/service.entity';
import { ServiceStatus, ServicePriority } from '../../domain/valueObjects/service.enum';

const props = defineProps<{ service: IServiceItem }>();
defineEmits(['toggle', 'finish']);

const elapsed = ref(0);
let timer: ReturnType<typeof setInterval>;

const computeElapsed = () => {
    const accTime = props.service.accumulatedTime || 0;

    if (props.service.status === ServiceStatus.IN_PROGRESS && props.service.lastResumedAt) {
        elapsed.value = accTime + (Date.now() - props.service.lastResumedAt);
    } else {
        elapsed.value = accTime;
    }
};

onMounted(() => {
    computeElapsed();
    timer = setInterval(computeElapsed, 1000);
});
onUnmounted(() => clearInterval(timer));

const formattedTime = computed(() => {
    const totalSeconds = Math.floor(elapsed.value / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
});

const isActive = computed(() => props.service.status === ServiceStatus.IN_PROGRESS);

const priorityColor = computed(() => {
    const map: Record<string, string> = {
        [ServicePriority.LOW]: 'bg-slate-300',
        [ServicePriority.MEDIUM]: 'bg-blue-400',
        [ServicePriority.HIGH]: 'bg-orange-400',
        [ServicePriority.URGENT]: 'bg-red-500'
    };
    return map[props.service.priority];
});

const statusTag = computed(() => {
    if (props.service.status === ServiceStatus.IN_PROGRESS) return { label: 'EM ANDAMENTO', type: 'success' };
    if (props.service.status === ServiceStatus.PAUSED) return { label: 'PAUSADO', type: 'warning' };
    return { label: 'CONCLUÍDO', type: 'info' };
});
</script>