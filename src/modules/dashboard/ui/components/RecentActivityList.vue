<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <h3 class="font-bold text-slate-800 text-lg mb-4">Atividade em Tempo Real</h3>
    <div class="space-y-4">
      <div v-for="item in activities" :key="item.id" class="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-default">
        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
          {{ item.userAvatar }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-800 truncate">
            <span class="font-bold">{{ item.userName }}</span> {{ item.action }} {{ item.target }}
          </p>
          <p v-if="item.fromStatus" class="text-xs text-slate-500">
            Alterou status de <span class="text-amber-600">{{ item.fromStatus }}</span> para <span class="text-green-600">{{ item.toStatus }}</span>
          </p>
        </div>
        <span class="text-xs text-slate-400 whitespace-nowrap">{{ item.time }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityItem } from '../../domain/entities/DashboardTypes';

defineProps<{ activities: ActivityItem[] }>();
</script>