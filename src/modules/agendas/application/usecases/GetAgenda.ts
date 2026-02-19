import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

export class GetAgenda {
    constructor(private readonly repository: IAppointmentRepository) {}

    async execute() {
        const [appointments, blockedDates] = await Promise.all([
            this.repository.getAll(),
            this.repository.getBlockedDates()
        ]);
        
        return { appointments, blockedDates };
    }
}