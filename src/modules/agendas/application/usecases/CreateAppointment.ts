import type { Appointment } from "../../domain/entities/Appointment";
import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

export class CreateAppointment {
    constructor(private readonly repository: IAppointmentRepository) {}

    async execute(newAppointment: Appointment): Promise<void> {
        const currentAppointments = await this.repository.getAll();
        
        const hasConflict = currentAppointments.some(apt => 
            apt.date === newAppointment.date && 
            apt.time === newAppointment.time && 
            apt.agent === newAppointment.agent &&
            apt.status !== 'canceled'
        );

        if (hasConflict) {
            throw new Error(`Conflito de horário detectado para o agente ${newAppointment.agent}.`);
        }

        await this.repository.create(newAppointment);
    }
}