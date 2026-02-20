import type { Appointment } from "../entities/Appointment";
import type { IAppointmentRepository } from "./IAppointmentRepository";

export class FetchAppointmentRepository implements IAppointmentRepository {
  private baseUrl = "http://localhost:3000/api/appointments"; 

  async getAll(): Promise<Appointment[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error("Falha ao buscar agendamentos");
    return response.json();
  }

  async create(appointment: Appointment): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    if (!response.ok) throw new Error("Falha ao criar agendamento");
  }

  async update(appointment: Appointment): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${appointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    if (!response.ok) throw new Error("Falha ao atualizar agendamento");
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Falha ao deletar agendamento");
  }

  async getBlockedDates(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/blocked-dates`);
    if (!response.ok) throw new Error("Falha ao buscar datas bloqueadas");
    return response.json();
  }

  async toggleBlockDate(date: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/blocked-dates/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date }),
    });
    if (!response.ok) throw new Error("Falha ao alternar bloqueio de data");
  }
}