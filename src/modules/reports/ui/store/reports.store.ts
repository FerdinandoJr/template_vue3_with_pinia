import { defineStore } from "pinia";
import { ref, inject } from "vue";
import type { ReportMetrics } from "../../domain/entities/ReportMetrics";
import { ReportsDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useReportsStore = defineStore("reports", () => {

  const getReportsMetricsUseCase = inject(ReportsDI.GetReportsMetrics)!;  
  const { showToast } = useToast();
  const loading = ref(false);
  const metrics = ref<ReportMetrics | null>(null);

  const loadMetrics = async () => {
    loading.value = true;
    try {
      metrics.value = await getReportsMetricsUseCase.execute();
    } catch (error) {
      console.error("[ReportsStore] Erro ao carregar métricas gerenciais:", error);
      showToast("Falha ao carregar os relatórios. Verifique sua conexão.", "error");
    } finally {
      loading.value = false;
    }
  };

  return { metrics, loading, loadMetrics };
});