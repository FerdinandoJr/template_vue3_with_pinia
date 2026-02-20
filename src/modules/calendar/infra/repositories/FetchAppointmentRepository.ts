import type { Appointment } from "../../domain/entities/Appointment";
import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

export class FetchAppointmentRepository implements IAppointmentRepository {
  private baseUrl = `${import.meta.env.VITE_API_URL}/appointments`;

  async getAll(): Promise<Appointment[]> {
    const response = await fetch(this.baseUrl);
    
    if (!response.ok) {
      throw new Error("Falha ao buscar agendamentos. Verifique sua conexão com o servidor.");
    }
    
    return await response.json();
  }

  async create(appointment: Appointment): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(appointment),
    });
    
    if (!response.ok) {
      throw new Error("Falha ao criar o agendamento no servidor.");
    }
  }

  async update(appointment: Appointment): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${appointment.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(appointment),
    });
    
    if (!response.ok) {
      throw new Error("Falha ao atualizar o agendamento no servidor.");
    }
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error("Falha ao deletar o agendamento no servidor.");
    }
  }

  async getBlockedDates(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/blocked-dates`);
    
    if (!response.ok) {
      throw new Error("Falha ao buscar datas bloqueadas.");
    }
    
    return await response.json();
  }

  async toggleBlockDate(date: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/blocked-dates/toggle`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ date }),
    });
    
    if (!response.ok) {
      throw new Error("Falha ao alternar bloqueio de data no servidor.");
    }
  }
}