import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

export class DeleteAppointment {
    constructor(private readonly repository: IAppointmentRepository) {}

    async execute(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}