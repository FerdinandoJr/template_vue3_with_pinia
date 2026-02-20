import { defineStore } from "pinia";
import { ref, inject } from "vue";
import type { DashboardData } from "../../domain/entities/DashboardTypes";
import { DashboardDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useDashboardStore = defineStore('dashboard', () => {
    const getDashboardMetricsUseCase = inject(DashboardDI.GetDashboardMetrics);
    const { showToast } = useToast();
    
    const loading = ref(false);
    
    const data = ref<DashboardData>({
        stats: [],
        volumeSeries: [],
        statusSeries: [],
        performanceSeries: [],
        recentActivity: []
    });

    const loadDashboard = async () => {
        if (!getDashboardMetricsUseCase) {
            const errorMsg = "Falta de configuração de injeção de dependência (GetDashboardMetrics).";
            console.error(errorMsg);
            showToast("Erro interno da aplicação.", "error");
            return;
        }

        loading.value = true;
        try {
            data.value = await getDashboardMetricsUseCase.execute();
        } catch (error) {
            console.error("[DashboardStore] Erro ao carregar métricas:", error);
            showToast("Falha ao carregar as métricas do dashboard. Tente novamente.", "error");
        } finally {
            loading.value = false;
        }
    };

    return { loading, data, loadDashboard };
});