<template>
  <div class="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-12">
    <div 
      class="w-44 h-44 rounded-full border-4 border-white shadow-lg flex-shrink-0" 
      style="background: conic-gradient(#3b82f6 0% 35%, #6366f1 35% 60%, #10b981 60% 85%, #34d399 85% 100%);"
    ></div>
    <div class="flex-1">
      <h3 class="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em] mb-8">Performance Equipe</h3>
      <div class="space-y-4">
        <div v-for="member in data" :key="member.name" class="flex justify-between items-center">
          <div class="flex items-center gap-3 text-[10px] font-bold text-slate-400">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: member.color }"></span>
            {{ member.name }}
          </div>
          <span class="text-[11px] font-black text-slate-800">{{ member.score }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamMemberPerformance } from '../../domain/entities/ReportMetrics';
defineProps<{ data: TeamMemberPerformance[] }>();
</script>