import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

export class ManageBlockedDates {
    constructor(private readonly repository: IAppointmentRepository) {}

    async toggle(date: string): Promise<string[]> {
        await this.repository.toggleBlockDate(date);
        return await this.repository.getBlockedDates();
    }
}