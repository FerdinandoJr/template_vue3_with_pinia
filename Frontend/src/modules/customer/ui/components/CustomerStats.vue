<template>
  <div class="mb-2">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stats-card !border-l-4 !border-l-blue-500">
          <div class="flex items-center justify-between">
            <el-statistic :value="total" title="Total de Clientes">
              <template #suffix>
                <el-icon class="text-blue-500">
                  <UserFilled />
                </el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stats-card !border-l-4 !border-l-green-500">
          <div class="flex items-center justify-between">
            <el-statistic :value="activeCount" title="Clientes Ativos">
              <template #suffix>
                <el-icon class="text-green-500">
                  <CircleCheck />
                </el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="stats-card !border-l-4 !border-l-orange-500">
          <div class="flex items-center justify-between">
            <el-statistic :value="inactiveCount" title="Inativos / Leads">
              <template #suffix>
                <el-icon class="text-orange-500">
                  <Warning />
                </el-icon>
              </template>
            </el-statistic>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UserFilled, CircleCheck, Warning } from '@element-plus/icons-vue'
import { useCustomerStore } from '../store/customer.store'
import { storeToRefs } from 'pinia'

const props = defineProps<{ total: number }>()

const store = useCustomerStore()
const { items } = storeToRefs(store)

const activeCount = computed(() => items.value.filter(c => c.status === 'active').length)
const inactiveCount = computed(() => items.value.filter(c => c.status !== 'active').length)
</script>

<style scoped>
.stats-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 16px;
}

.stats-card:hover {
  transform: translateY(-2px);
}

:deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: bold;
  color: #1e293b;
}

:deep(.el-statistic__head) {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}
</style>