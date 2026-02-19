import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Appointment } from "../../domain/entities/Appointment";
import {
  getAgendaUseCase,
  createAppointmentUseCase,
  manageBlockedDatesUseCase,
} from "../../di";
import { InMemoryAppointmentRepository } from "../../infra/repositories/InMemoryAppointmentRepository";

const repo = new InMemoryAppointmentRepository();

export const useAgendaStore = defineStore("agenda", () => {
  const currentMonth = ref(new Date());
  const appointments = ref<Appointment[]>([]);
  const blockedDates = ref<string[]>([]);
  const isGoogleConnected = ref(false);
  const viewType = ref<"month" | "week" | "day">("month"); // Suporte a 'day'
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

  const checkConflict = (
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): boolean => {
    const toMin = (t: string) => {
      const parts = t.split(":").map(Number);
      return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
    };

    const newStart = toMin(startTime);
    const newEnd = toMin(endTime);

    return appointments.value.some((appt) => {
      if (excludeId && appt.id === excludeId) return false;
      if (appt.date !== date) return false;
      if (selectedAgent.value !== "all" && appt.agent !== selectedAgent.value)
        return false;

      const apptStart = toMin(appt.time);
      const apptEnd = toMin(appt.endTime);

      return newStart < apptEnd && newEnd > apptStart;
    });
  };

  const loadAgenda = async () => {
    loading.value = true;
    try {
      const data = await getAgendaUseCase.execute();
      appointments.value = data.appointments;
      blockedDates.value = data.blockedDates;
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const addAppointment = async (appt: Appointment) => {
    if (
      checkConflict(
        appt.date,
        appt.time,
        appt.endTime,
        appt.id !== 0 ? appt.id : undefined,
      )
    ) {
      return {
        success: false,
        message: "⚠️ Conflito de horário detectado para este agente.",
      };
    }

    try {
      if (appt.id !== 0) {
        // Update Simulado
        const index = appointments.value.findIndex((a) => a.id === appt.id);
        if (index !== -1) {
          appointments.value[index] = appt;
          await repo.update(appt);
        }
      } else {
        // Create
        await createAppointmentUseCase.execute(appt);
      }

      await loadAgenda();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      await repo.delete(id);
      await loadAgenda();
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const updateAppointmentTime = async (
    id: number,
    newDate: Date,
    newTime: string,
    newEndTime?: string,
  ) => {
    const appt = appointments.value.find((a) => a.id === id);
    if (appt) {
      const dateStr = formatDateKey(newDate);
      let finalEndTime = newEndTime;

      // Se apenas moveu (drag), calcula novo fim mantendo duração
      if (!finalEndTime) {
        const startParts = appt.time.split(":").map(Number);
        const h = startParts[0] ?? 0;
        const m = startParts[1] ?? 0;

        const endParts = appt.endTime.split(":").map(Number);
        const endH = endParts[0] ?? 0;
        const endM = endParts[1] ?? 0;

        const durationMin = endH * 60 + endM - (h * 60 + m);

        const newStartParts = newTime.split(":").map(Number);
        const newH = newStartParts[0] ?? 0;
        const newM = newStartParts[1] ?? 0;

        const newEndTotal = newH * 60 + newM + durationMin;

        const fEndH = Math.floor(newEndTotal / 60);
        const fEndM = newEndTotal % 60;
        finalEndTime = `${fEndH.toString().padStart(2, "0")}:${fEndM.toString().padStart(2, "0")}`;
      }

      if (checkConflict(dateStr, newTime, finalEndTime as string, id)) {
        await loadAgenda(); // Reverte visualmente
        return;
      }

      const updatedAppt = {
        ...appt,
        date: dateStr,
        time: newTime,
        endTime: finalEndTime as string,
      };
      const index = appointments.value.findIndex((a) => a.id === id);
      if (index !== -1) appointments.value[index] = updatedAppt;

      await repo.update(updatedAppt);
    }
  };

  const nextPeriod = () => {
    const date = new Date(currentMonth.value);
    if (viewType.value === "month") {
      date.setMonth(date.getMonth() + 1);
    } else if (viewType.value === "week") {
      date.setDate(date.getDate() + 7);
    } else {
      date.setDate(date.getDate() + 1);
    }
    currentMonth.value = date;
  };

  const prevPeriod = () => {
    const date = new Date(currentMonth.value);
    if (viewType.value === "month") {
      date.setMonth(date.getMonth() - 1);
    } else if (viewType.value === "week") {
      date.setDate(date.getDate() - 7);
    } else {
      date.setDate(date.getDate() - 1);
    }
    currentMonth.value = date;
  };

  const goToToday = () => {
    currentMonth.value = new Date();
  };

  const isDateBlocked = (date: Date) =>
    blockedDates.value.includes(formatDateKey(date));

  const toggleBlockDate = async (date: Date) => {
    const key = formatDateKey(date);
    blockedDates.value = await manageBlockedDatesUseCase.toggle(key);
  };

  const toggleGoogleSync = () => {
    isGoogleConnected.value = !isGoogleConnected.value;
  };

  return {
    currentMonth,
    appointments: filteredAppointments,
    allAppointments: appointments,
    upcomingAppointments,
    viewType,
    selectedAgent,
    loading,
    loadAgenda,
    getAppointmentsByDate,
    addAppointment,
    deleteAppointment, // Exportado
    updateAppointmentTime,
    checkConflict,
    isDateBlocked,
    toggleBlockDate,
    toggleGoogleSync,
    nextPeriod,
    prevPeriod,
    goToToday,
  };
});
