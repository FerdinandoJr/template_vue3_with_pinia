import type { Appointment } from "../entities/Appointment";

export interface IAppointmentRepository {
  getAll(): Promise<Appointment[]>;
  create(appointment: Appointment): Promise<void>;
  getBlockedDates(): Promise<string[]>;
  toggleBlockDate(date: string): Promise<void>;
}
