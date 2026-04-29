<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col h-full shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="font-bold text-slate-800 text-base">Últimos Atendimentos Finalizados</h3>
        <p class="text-xs text-slate-500 mt-1">Histórico recente de finalizações detalhadas</p>
      </div>
      <el-button size="small" :icon="Refresh" circle @click="loadFinishedChats" />
    </div>

    <div class="flex-1 overflow-x-auto">
      <el-table :data="finishedChats" style="width: 100%" v-loading="loading" stripe :empty-text="'Nenhum atendimento finalizado hoje'">
        <el-table-column prop="company" label="Cliente / Contato" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-avatar :size="28" :src="row.avatar">{{ row.name?.charAt(0) }}</el-avatar>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-slate-700 truncate">{{ row.name }}</span>
                <span class="text-[10px] text-slate-400 truncate">{{ row.company || row.phone }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="finishReason" label="Motivo de Finalização" width="160">
          <template #default="{ row }">
            <el-tag size="small" effect="light" :type="getReasonType(row.finishReason)">
              {{ formatReason(row.finishReason) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="finishDescription" label="Descrição / Observações (Obrigatória)" min-width="250">
          <template #default="{ row }">
            <p class="text-xs text-slate-600 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
              {{ row.finishDescription || 'Sem detalhes' }}
            </p>
          </template>
        </el-table-column>

        <el-table-column prop="finishedAt" label="Horário" width="120" align="right">
          <template #default="{ row }">
            <span class="text-xs font-medium text-slate-500">
              {{ formatTime(row.finishedAt) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { useChatStore } from '../../../chats/ui/store/chat.store';

const chatStore = useChatStore();
const loading = ref(false);
const finishedChats = ref<any[]>([]);

const loadFinishedChats = () => {
  loading.value = true;
  const list = chatStore.contacts.filter(c => (c as any).status === 'finished');
  
  finishedChats.value = list.sort((a, b) => {
    const dateA = (a as any).finishedAt ? new Date((a as any).finishedAt).getTime() : 0;
    const dateB = (b as any).finishedAt ? new Date((b as any).finishedAt).getTime() : 0;
    return dateB - dateA;
  });
  
  loading.value = false;
};

const getReasonType = (reason: string) => {
  switch (reason) {
    case 'duvida_resolvida': return 'success';
    case 'venda_concluida': return 'success';
    case 'problema_tecnico': return 'danger';
    case 'sem_resposta': return 'info';
    case 'outro': return 'warning';
    default: return 'info';
  }
};

const formatReason = (reason: string) => {
  switch (reason) {
    case 'duvida_resolvida': return 'Dúvida Resolvida';
    case 'venda_concluida': return 'Venda Concluída';
    case 'problema_tecnico': return 'Problema Técnico';
    case 'sem_resposta': return 'Sem Resposta';
    case 'outro': return 'Outro Motivo';
    default: return reason || 'Não informado';
  }
};

const formatTime = (date: Date | string) => {
  if (!date) return '--:--';
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  loadFinishedChats();
});
</script>
