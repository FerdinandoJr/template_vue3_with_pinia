import type { CustomerStatus } from "../valueObjects/customer-status.enum"

export interface ICustomer {
  uuid: string
  name: string
  companyName: string
  email: string
  phone: string
  avatar: string
  status: CustomerStatus
  source: string
  lastInteraction: Date
  openTickets: number
  csat: number
  tags: string[]
}
