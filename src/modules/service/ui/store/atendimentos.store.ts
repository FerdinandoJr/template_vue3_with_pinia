import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { ServiceRecord } from "../../domain/entities/ServiceRecord";
import { ServiceDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export interface FinishServicePayload {
  companyName: string;
  cnpj: string;
  reason: string;
  description: string;
  duration: string;
}

export const useAtendimentosStore = defineStore("atendimentos", () => {
  const getServiceHistoryUseCase = inject(ServiceDI.GetServiceHistory)!;
  const registerAttendanceUseCase = inject(ServiceDI.RegisterAttendance)!;
  
  const { showToast } = useToast();

  const records = ref<ServiceRecord[]>([]);
  const loading = ref(false);
  const searchQuery = ref("");

  const filteredRecords = computed(() => {
    if (!searchQuery.value) return records.value;
    const lower = searchQuery.value.toLowerCase();
    return records.value.filter(
      (r) =>
        r.companyName.toLowerCase().includes(lower) ||
        r.agentName.toLowerCase().includes(lower) ||
        r.id.includes(lower),
    );
  });

  const loadRecords = async () => {
    loading.value = true;
    try {
      records.value = await getServiceHistoryUseCase.execute();
    } catch (error) {
      console.error("[AtendimentosStore] Erro ao carregar histórico:", error);
      showToast("Falha ao carregar o histórico de atendimentos.", "error");
    } finally {
      loading.value = false;
    }
  };

  const registerFinish = async (data: FinishServicePayload) => {
    loading.value = true;
    try {
      await registerAttendanceUseCase.execute({
        companyName: data.companyName,
        cnpj: data.cnpj,
        agentName: "Usuário Logado",
        status: "active",
        reason: data.reason,
        description: data.description,
        duration: data.duration,
      });
      
      showToast("Atendimento finalizado e registrado com sucesso!", "success");
      await loadRecords();
    } catch (error) {
      console.error("[AtendimentosStore] Erro ao registrar atendimento:", error);
      showToast("Erro ao registrar a finalização do atendimento.", "error");
    } finally {
      loading.value = false;
    }
  };

  return {
    records,
    loading,
    searchQuery,
    filteredRecords,
    loadRecords,
    registerFinish,
  };
});