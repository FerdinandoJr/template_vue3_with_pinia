import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Appointment } from "../../domain/entities/Appointment";
import {
  getAgendaUseCase,
  createAppointmentUseCase,
  manageBlockedDatesUseCase,
  checkAppointmentConflictUseCase
} from "../../di";
import { InMemoryAppointmentRepository } from "../../infra/repositories/InMemoryAppointmentRepository";

const repo = new InMemoryAppointmentRepository();

export const useAgendaStore = defineStore("agenda", () => {
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
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const addAppointment = async (appt: Appointment) => {
    const hasConflict = await checkAppointmentConflictUseCase.execute(
        appt.date, appt.time, appt.endTime, appt.agent, appt.id !== 0 ? appt.id : undefined
    );

    if (hasConflict) {
      return { success: false, message: "⚠️ Conflito de horário detectado para este agente." };
    }

    try {
      if (appt.id !== 0) {
        const index = appointments.value.findIndex((a) => a.id === appt.id);
        if (index !== -1) {
          appointments.value[index] = appt;
          await repo.update(appt);
        }
      } else {
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

  const updateAppointmentTime = async (id: number, newDate: Date, newTime: string, newEndTime?: string) => {
    const appt = appointments.value.find((a) => a.id === id);
    if (!appt) return;

    const dateStr = formatDateKey(newDate);
    let finalEndTime = newEndTime;

    if (!finalEndTime) {
      const startParts = appt.time.split(":").map(Number);
      const endParts = appt.endTime.split(":").map(Number);
      const durationMin = (endParts[0] ?? 0) * 60 + (endParts[1] ?? 0) - ((startParts[0] ?? 0) * 60 + (startParts[1] ?? 0));

      const newStartParts = newTime.split(":").map(Number);
      const newEndTotal = (newStartParts[0] ?? 0) * 60 + (newStartParts[1] ?? 0) + durationMin;

      const fEndH = Math.floor(newEndTotal / 60);
      const fEndM = newEndTotal % 60;
      finalEndTime = `${fEndH.toString().padStart(2, "0")}:${fEndM.toString().padStart(2, "0")}`;
    }

    const hasConflict = await checkAppointmentConflictUseCase.execute(dateStr, newTime, finalEndTime, appt.agent, id);

    if (hasConflict) {
      await loadAgenda(); 
      return;
    }

    const updatedAppt = { ...appt, date: dateStr, time: newTime, endTime: finalEndTime };
    const index = appointments.value.findIndex((a) => a.id === id);
    if (index !== -1) appointments.value[index] = updatedAppt;

    await repo.update(updatedAppt);
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
    const key = formatDateKey(date);
    blockedDates.value = await manageBlockedDatesUseCase.toggle(key);
  };

  const toggleGoogleSync = () => isGoogleConnected.value = !isGoogleConnected.value;

  return {
    currentMonth, appointments: filteredAppointments, allAppointments: appointments,
    upcomingAppointments, viewType, selectedAgent, loading,
    loadAgenda, getAppointmentsByDate, addAppointment, deleteAppointment,
    updateAppointmentTime, isDateBlocked, toggleBlockDate, toggleGoogleSync,
    nextPeriod, prevPeriod, goToToday,
  };
});