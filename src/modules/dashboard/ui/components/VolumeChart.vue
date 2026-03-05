<template>
    <el-card shadow="hover" class="!rounded-[24px] border-slate-100 shadow-sm" :body-style="{ padding: '24px' }">
        <h3 class="font-extrabold text-slate-800 mb-4 uppercase text-[12px] tracking-widest text-slate-400">
            Volume de Atendimento
        </h3>
        <apexchart type="area" height="300" :options="chartOptions" :series="series" />
    </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ data: number[] }>();

const series = computed(() => [{
    name: 'Atendimentos',
    data: props.data || []
}]);

const chartOptions = {
    chart: { toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    colors: ['#3b82f6'],
    xaxis: { categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] }
};
</script>