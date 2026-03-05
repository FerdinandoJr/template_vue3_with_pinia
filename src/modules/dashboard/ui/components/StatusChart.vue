<template>
    <el-card shadow="hover" class="!rounded-[24px] border-slate-100 shadow-sm" :body-style="{ padding: '24px' }">
        <h3 class="font-extrabold text-slate-800 mb-4 uppercase text-[12px] tracking-widest text-slate-400">
            Status dos Tickets
        </h3>
        <apexchart type="donut" height="300" :options="chartOptions" :series="data" />
    </el-card>
</template>

<script setup lang="ts">
defineProps<{ data: number[] }>();

const chartOptions = {
    labels: ['Abertos', 'Em Progresso', 'Resolvidos'],
    colors: ['#f59e0b', '#3b82f6', '#10b981'],
    legend: { position: 'bottom' }
};
</script>