export type AppointmentStatus = "confirmed" | "pending" | "canceled";
export type AppointmentType = "meeting" | "support" | "installation";

export interface Appointment {
  id: number;
  title: string;
  clientId?: number;
  clientName: string;
  agent: string;
  date: string;
  time: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  color: string;
  description?: string;
}
