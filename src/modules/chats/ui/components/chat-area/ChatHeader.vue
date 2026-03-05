<template>
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
                <el-button @click="$emit('assumir')" type="success" size="small"
                    class="!font-bold !bg-[#25D366] !border-[#25D366]">
                    <el-icon class="mr-1">
                        <Pointer />
                    </el-icon> Assumir Chamado
                </el-button>
            </template>

            <template v-else-if="contact.status === 'in_progress'">
                <el-button @click="$emit('abrir-modal-ticket')" type="warning" plain size="small" class="!font-bold">
                    <el-icon class="mr-1">
                        <Ticket />
                    </el-icon> Ticket
                </el-button>
                <el-button @click="$emit('transferir')" plain size="small" class="!font-bold">
                    <el-icon class="mr-1">
                        <Switch />
                    </el-icon> Transferir
                </el-button>
                <el-button @click="$emit('finalizar')" type="danger" plain size="small" class="!font-bold">
                    <el-icon class="mr-1">
                        <Check />
                    </el-icon> Finalizar
                </el-button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plus, Check, Pointer, Ticket, Switch } from '@element-plus/icons-vue';
import type { IContact } from '../../../domain/entities/chat';

const props = defineProps<{ contact?: IContact; }>();

defineEmits(['toggle-profile', 'vincular', 'assumir', 'abrir-modal-ticket', 'transferir', 'finalizar']);

const isUnsavedContact = computed(() => {
    if (!props.contact) return false;
    return props.contact.name === props.contact.phone || String(props.contact.name).includes('+');
});
</script>