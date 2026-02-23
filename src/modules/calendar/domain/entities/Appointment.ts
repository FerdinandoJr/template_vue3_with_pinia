import type { st } from "vue-router/dist/router-CWoNjPRp.mjs"

export type AppointmentStatus = "confirmed" | "pending" | "canceled"
export type AppointmentType = "meeting" | "support" | "installation"

export interface Appointment {
  id: number
  title: string
  clientId?: string
  clientName: string
  agent: string
  date: string
  time: string
  endTime: string
  type: AppointmentType
  status: AppointmentStatus
  color: string
  description?: string
}
