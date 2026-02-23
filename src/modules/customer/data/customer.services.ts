import type { un } from "vue-router/dist/router-CWoNjPRp.mjs"
import type { ICustomer } from "../domain/entities/customer"
import { CustomerStatus } from "../domain/valueObjects/customer-status.enum"

export interface CustomerFilter {

}


export interface Paginated<T> {
  /** Total de registros na fonte, sem filtros */
  total: number
  /** Total de registros que batem com o filtro atual */
  filteredTotal: number
  items: T[]
}


export const customerServices = {
  list(filter: CustomerFilter): Paginated<ICustomer> {
    return {
      total: mock.length,
      filteredTotal: mock.length,
      items: mock
    }
  },

  getById(uuid: string): ICustomer | undefined {
    return mock.find(item => item.uuid === uuid)
  }
}



const mock: ICustomer[] = [
  {
    uuid: "0001",
    name: "Customer A",
    companyName: "Company A",
    email: "customerA@email.com",
    phone: "1899999999999",
    avatar: 'CA',
    status: CustomerStatus.ACTIVE,
    source: 'Facebook',
    lastInteraction: new Date(),
    openTickets: 2,
    csat: 1,
    tags: ['Inadimplente', 'Risco']
  },
  {
    uuid: "0001",
    name: "Customer B",
    companyName: "Company B",
    email: "customerB@email.com",
    phone: "1899999999999",
    avatar: 'CB',
    status: CustomerStatus.ONBOARDING,
    source: 'Whatsapp',
    lastInteraction: new Date(),
    openTickets: 3,
    csat: 2,
    tags: ['VIP', 'SLA Crítico']
  }
]