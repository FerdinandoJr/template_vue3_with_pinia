import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

export class CheckAppointmentConflict {
    constructor(private readonly repository: IAppointmentRepository) {}

    async execute(
        date: string, 
        startTime: string, 
        endTime: string, 
        agent: string, 
        excludeId?: number
    ): Promise<boolean> {
        const appointments = await this.repository.getAll();
        
        const toMin = (t: string) => {
            const parts = t.split(":").map(Number);
            return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
        };

        const newStart = toMin(startTime);
        const newEnd = toMin(endTime);

        return appointments.some((appt) => {
            if (excludeId && appt.id === excludeId) return false;
            if (appt.date !== date) return false;
            if (agent !== "all" && appt.agent !== agent) return false;

            const apptStart = toMin(appt.time);
            const apptEnd = toMin(appt.endTime);

            return newStart < apptEnd && newEnd > apptStart;
        });
    }
}