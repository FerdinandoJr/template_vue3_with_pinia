import { defineStore } from "pinia";
import { ref } from "vue";
import type { ReportMetrics } from "../../domain/entities/ReportMetrics";
import { getReportsMetricsUseCase } from "../../di";

export const useReportsStore = defineStore("reports", () => {
  const loading = ref(false);
  const metrics = ref<ReportMetrics | null>(null);

  const loadMetrics = async () => {
    loading.value = true;
    try {
      metrics.value = await getReportsMetricsUseCase.execute();
    } finally {
      loading.value = false;
    }
  };

  return { metrics, loading, loadMetrics };
});
