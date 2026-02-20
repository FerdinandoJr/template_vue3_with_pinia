import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { AppointmentService } from "../../domain/services/AppointmentService";
import type { CheckAppointmentConflict } from "./CheckAppointmentConflict";

export class UpdateAppointment {
    constructor(
        private readonly repository: IAppointmentRepository,
        private readonly checkConflictUseCase: CheckAppointmentConflict
    ) {}

    async execute(id: number, newDate: string, newTime: string, newEndTime?: string): Promise<void> {
        const appointments = await this.repository.getAll();
        const appt = appointments.find((a) => a.id === id);

        if (!appt) {
            throw new Error("Agendamento não encontrado.");
        }

        const finalEndTime = newEndTime || AppointmentService.calculateEndTime(appt.time, appt.endTime, newTime);

        const hasConflict = await this.checkConflictUseCase.execute(newDate, newTime, finalEndTime, appt.agent, id);

        if (hasConflict) {
            throw new Error("Conflito de horário detectado para este agente.");
        }

        const updatedAppt = { ...appt, date: newDate, time: newTime, endTime: finalEndTime };
        await this.repository.update(updatedAppt);
    }
}