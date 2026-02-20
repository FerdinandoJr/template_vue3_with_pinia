import type { Appointment } from "../../domain/entities/Appointment";
import type { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";

export class InMemoryAppointmentRepository implements IAppointmentRepository {
  private appointments: Appointment[] = [
    {
      id: 1,
      title: "Reunião de Alinhamento",
      clientId: 1,
      clientName: "Tech Solutions",
      agent: "Ana Silva",
      date: "2026-03-05",
      time: "09:00",
      endTime: "10:00",
      type: "meeting",
      status: "confirmed",
      color: "#3b82f6",
      description: "Revisão mensal de métricas.",
    },
    {
      id: 2,
      title: "Instalação de Certificado",
      clientId: 2,
      clientName: "Padaria Central",
      agent: "Carlos Mendes",
      date: "2026-03-05",
      time: "14:30",
      endTime: "15:30",
      type: "support",
      status: "pending",
      color: "#f59e0b",
      description: "Acesso remoto via AnyDesk.",
    },
    {
      id: 3,
      title: "Demo do Sistema",
      clientId: 3,
      clientName: "Novo Cliente Ltda",
      agent: "Eu",
      date: new Date().toISOString().split("T")[0] ?? "",
      time: "10:00",
      endTime: "11:30",
      type: "meeting",
      status: "confirmed",
      color: "#10b981",
      description: "Apresentação comercial.",
    },
  ];

  private blockedDates: string[] = ["2026-03-01", "2026-03-08", "2026-03-15"];

  async getAll(): Promise<Appointment[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...this.appointments]), 300),
    );
  }

  async create(appointment: Appointment): Promise<void> {
    return new Promise((resolve) => {
      this.appointments.push({ ...appointment, id: Date.now() });
      setTimeout(resolve, 300);
    });
  }

  async update(appointment: Appointment): Promise<void> {
    return new Promise((resolve) => {
      const index = this.appointments.findIndex((a) => a.id === appointment.id);
      if (index !== -1) {
        this.appointments[index] = appointment;
      }
      setTimeout(resolve, 100);
    });
  }

  async delete(id: number): Promise<void> {
    return new Promise((resolve) => {
      this.appointments = this.appointments.filter((a) => a.id !== id);
      setTimeout(resolve, 200);
    });
  }

  async getBlockedDates(): Promise<string[]> {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...this.blockedDates]), 300),
    );
  }

  async toggleBlockDate(date: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.blockedDates.includes(date)) {
        this.blockedDates = this.blockedDates.filter((d) => d !== date);
      } else {
        this.blockedDates.push(date);
      }
      setTimeout(resolve, 300);
    });
  }
}
