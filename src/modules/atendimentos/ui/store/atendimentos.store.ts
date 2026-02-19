import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ServiceRecord } from "../../domain/entities/ServiceRecord";
import { getServiceHistoryUseCase, registerAttendanceUseCase } from "../../di";

export const useAtendimentosStore = defineStore("atendimentos", () => {
  const records = ref<ServiceRecord[]>([]);
  const loading = ref(false);
  const searchQuery = ref("");
  const isRegisterModalOpen = ref(false);

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
    records.value = await getServiceHistoryUseCase.execute();
    loading.value = false;
  };

  const registerFinish = async (data: any) => {
    await registerAttendanceUseCase.execute({
      companyName: data.companyName,
      cnpj: data.cnpj,
      agentName: "Eu (Admin)",
      status: "active",
      reason: data.reason,
      description: data.description,
      duration: data.duration,
    });
    await loadRecords();
    isRegisterModalOpen.value = false;
  };

  const openModal = () => (isRegisterModalOpen.value = true);
  const closeModal = () => (isRegisterModalOpen.value = false);

  return {
    records,
    loading,
    searchQuery,
    filteredRecords,
    isRegisterModalOpen,
    loadRecords,
    registerFinish,
    openModal,
    closeModal,
  };
});
