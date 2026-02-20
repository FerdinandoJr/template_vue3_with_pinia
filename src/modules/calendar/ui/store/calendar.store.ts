import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { Appointment } from "../../domain/entities/Appointment";
import { CalendarDI } from "../../di";
import { useToast } from "@/core/composables/useToast";

export const useAgendaStore = defineStore("agenda", () => {
  const getAgendaUseCase = inject(CalendarDI.GetAgenda)!;
  const createAppointmentUseCase = inject(CalendarDI.CreateAppointment)!;
  const manageBlockedDatesUseCase = inject(CalendarDI.ManageBlockedDates)!;
  const checkAppointmentConflictUseCase = inject(CalendarDI.CheckAppointmentConflict)!;
  const updateAppointmentUseCase = inject(CalendarDI.UpdateAppointment)!;
  const deleteAppointmentUseCase = inject(CalendarDI.DeleteAppointment)!;
  const { showToast } = useToast();
  const currentMonth = ref(new Date());
  const appointments = ref<Appointment[]>([]);
  const blockedDates = ref<string[]>([]);
  const isGoogleConnected = ref(false);
  const viewType = ref<"month" | "week" | "day">("month");
  const loading = ref(false);
  const selectedAgent = ref<string>("all");

  const upcomingAppointments = computed(() => {
    return [...appointments.value]
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime(),
      )
      .slice(0, 4);
  });

  const filteredAppointments = computed(() => {
    if (selectedAgent.value === "all") return appointments.value;
    return appointments.value.filter((a) => a.agent === selectedAgent.value);
  });

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getAppointmentsByDate = (date: Date): Appointment[] => {
    const key = formatDateKey(date);
    return filteredAppointments.value.filter((a) => a.date === key);
  };

  const loadAgenda = async () => {
    loading.value = true;
    try {
      const data = await getAgendaUseCase.execute();
      appointments.value = data.appointments;
      blockedDates.value = data.blockedDates;
    } catch (e: any) {
      console.error("[AgendaStore] Erro ao carregar agenda:", e);
      showToast("Erro ao carregar a agenda. Tente novamente.", "error");
    } finally {
      loading.value = false;
    }
  };

  const addAppointment = async (appt: Appointment) => {
    try {
      if (appt.id !== 0) {
        await updateAppointmentUseCase.execute(appt.id, appt.date, appt.time, appt.endTime);
        showToast("Agendamento atualizado com sucesso!", "success");
      } else {
        const hasConflict = await checkAppointmentConflictUseCase.execute(
            appt.date, appt.time, appt.endTime, appt.agent
        );

        if (hasConflict) {
          showToast("Conflito de horário detectado para este agente.", "error");
          return { success: false, message: "⚠️ Conflito de horário detectado para este agente." };
        }
        
        await createAppointmentUseCase.execute(appt);
        showToast("Agendamento criado com sucesso!", "success");
      }

      await loadAgenda();
      return { success: true };
    } catch (error: any) {
      showToast(error.message || "Erro ao salvar o agendamento.", "error");
      return { success: false, message: error.message };
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      await deleteAppointmentUseCase.execute(id);
      showToast("Agendamento excluído com sucesso!", "success");
      await loadAgenda();
      return { success: true };
    } catch (error: any) {
      showToast(error.message || "Erro ao excluir o agendamento.", "error");
      return { success: false, message: error.message };
    }
  };

  const updateAppointmentTime = async (id: number, newDate: Date, newTime: string, newEndTime?: string) => {
    try {
      const dateStr = formatDateKey(newDate);
      await updateAppointmentUseCase.execute(id, dateStr, newTime, newEndTime);
      await loadAgenda();
      showToast("Horário atualizado com sucesso!", "success");
    } catch (error: any) {
      console.warn("Horário não atualizado:", error.message);
      showToast(error.message || "Erro ao atualizar horário.", "error");
      await loadAgenda();
    }
  };

  const nextPeriod = () => {
    const date = new Date(currentMonth.value);
    if (viewType.value === "month") date.setMonth(date.getMonth() + 1);
    else if (viewType.value === "week") date.setDate(date.getDate() + 7);
    else date.setDate(date.getDate() + 1);
    currentMonth.value = date;
  };

  const prevPeriod = () => {
    const date = new Date(currentMonth.value);
    if (viewType.value === "month") date.setMonth(date.getMonth() - 1);
    else if (viewType.value === "week") date.setDate(date.getDate() - 7);
    else date.setDate(date.getDate() - 1);
    currentMonth.value = date;
  };

  const goToToday = () => currentMonth.value = new Date();

  const isDateBlocked = (date: Date) => blockedDates.value.includes(formatDateKey(date));

  const toggleBlockDate = async (date: Date) => {
    try {
      const key = formatDateKey(date);
      blockedDates.value = await manageBlockedDatesUseCase.toggle(key);
      showToast(
        blockedDates.value.includes(key) ? "Data bloqueada na agenda." : "Data desbloqueada com sucesso.", 
        "success"
      );
    } catch (error: any) {
      showToast("Erro ao alterar bloqueio da data.", "error");
    }
  };

  const toggleGoogleSync = () => {
    isGoogleConnected.value = !isGoogleConnected.value;
    if (isGoogleConnected.value) {
        showToast("Sincronização com Google Calendar ativada.", "success");
    } else {
        showToast("Sincronização com Google Calendar desativada.", "info");
    }
  };

  return {
    currentMonth, appointments: filteredAppointments, allAppointments: appointments,
    upcomingAppointments, viewType, selectedAgent, loading,
    loadAgenda, getAppointmentsByDate, addAppointment, deleteAppointment,
    updateAppointmentTime, isDateBlocked, toggleBlockDate, toggleGoogleSync,
    nextPeriod, prevPeriod, goToToday,
  };
});