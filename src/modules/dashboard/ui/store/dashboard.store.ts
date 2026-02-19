import { defineStore } from "pinia";
import { ref } from "vue";
import type { DashboardData } from "../../domain/entities/DashboardTypes";
import { getDashboardMetricsUseCase } from "../../di";

export const useDashboardStore = defineStore('dashboard', () => {
    const loading = ref(false);
    const data = ref<DashboardData>({
        stats: [],
        volumeSeries: [],
        statusSeries: [],
        performanceSeries: [],
        recentActivity: []
    });

    const loadDashboard = async () => {
        loading.value = true;
        try {
            data.value = await getDashboardMetricsUseCase.execute();
        } catch (error) {
            console.error("Erro ao carregar dashboard", error);
        } finally {
            loading.value = false;
        }
    };

    return { loading, data, loadDashboard };
});